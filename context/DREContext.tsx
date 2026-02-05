import React, { createContext, useContext, useState } from 'react';
import { DREData, DREMensal, DREAcumulado } from '../types';
import * as XLSX from 'xlsx';

interface DREContextType {
  dreData: DREData | null;
  loading: boolean;
  error: string | null;
  anoSelecionado: number;
  mesSelecionado: number;
  regimeSelecionado: 'caixa' | 'competencia' | 'ambos';
  periodoInicio: number;
  periodoFim: number;
  setAnoSelecionado: (ano: number) => void;
  setMesSelecionado: (mes: number) => void;
  setRegimeSelecionado: (regime: 'caixa' | 'competencia' | 'ambos') => void;
  setPeriodoInicio: (mes: number) => void;
  setPeriodoFim: (mes: number) => void;
  carregarDREMensal: (file: File) => Promise<void>;
  carregarDREAcumulado: (file: File) => Promise<void>;
  setDados: (data: DREData) => void;
}

const DREContext = createContext<DREContextType | undefined>(undefined);

const mesMap: { [key: string]: number } = {
  'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
  'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
};

const parseDRELine = (descricao: string) => {
  const isResultado = descricao.trim().startsWith('(=)');
  const isDespesa = descricao.trim().startsWith('(-)');
  const isPercentual = descricao.includes('Margem');
  const isFinal = descricao.includes('Lucro ou Prejuízo') || descricao.includes('EBITDA');

  return { descricao, isResultado, isDespesa, isPercentual, isFinal };
};

const parseNumero = (valor: any): number => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;

  const str = String(valor).replace(/\./g, '').replace(',', '.').replace('%', '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

export const DREProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState(2025);
  const [mesSelecionado, setMesSelecionado] = useState(11); // Novembro
  const [regimeSelecionado, setRegimeSelecionado] = useState<'caixa' | 'competencia' | 'ambos'>('caixa');
  const [periodoInicio, setPeriodoInicio] = useState(1); // Janeiro
  const [periodoFim, setPeriodoFim] = useState(11); // Novembro

  const carregarDRECompleto = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);

      // Abas mensais
      const sheetCaixaMensal = workbook.Sheets['Regime de Caixa'];
      const sheetCompetenciaMensal = workbook.Sheets['Regime de Competência'];

      // Abas acumuladas
      const sheetCaixaAcumulado = workbook.Sheets['Regime de Caixa Enxuto'];
      const sheetCompetenciaAcumulado = workbook.Sheets['Regime de Competência Enxuto'];

      // Validação de abas
      if (!sheetCaixaMensal || !sheetCompetenciaMensal || !sheetCaixaAcumulado || !sheetCompetenciaAcumulado) {
        setError('❌ Planilha deve conter as 4 abas: "Regime de Caixa", "Regime de Competência", "Regime de Caixa Enxuto" e "Regime de Competência Enxuto"');
        return;
      }

      const parseDREMensalSheet = (sheet: any): DREMensal[] => {
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        // Espera: primeira linha = ano, segunda = empresa, terceira = cabeçalho
        if (!data[0] || !data[1]) {
          setError('❌ Abas mensais devem ter pelo menos duas linhas: ano e empresa.');
          return [];
        }
        const ano = typeof data[0][0] === 'number' ? data[0][0] : parseInt(data[0][0]);
        const empresa = data[1][0] || '';
        const result: DREMensal[] = [];
        for (let i = 2; i < data.length; i++) {
          const row = data[i];
          if (!row[0]) continue;
          result.push({
            linha: parseDRELine(row[0]),
            projetado: parseNumero(row[1]),
            real: parseNumero(row[2]),
            variacao: row[3] || '0%',
            analiseVertical: row[4] || ''
          });
        }
        return result;
      };

      const parseDREAcumuladoSheet = (sheet: any): DREAcumulado[] => {
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        if (!data[0] || !data[1]) {
          setError('❌ Abas acumuladas devem ter pelo menos duas linhas: ano e empresa.');
          return [];
        }
        const ano = typeof data[0][0] === 'number' ? data[0][0] : parseInt(data[0][0]);
        const empresa = data[1][0] || '';
        const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez','total'];
        const result: DREAcumulado[] = [];
        for (let i = 2; i < data.length; i++) {
          const row = data[i];
          if (!row[0]) continue;
          const valores: any = {};
          for (let m = 0; m < meses.length; m++) {
            valores[meses[m]] = parseNumero(row[m+1]);
          }
          result.push({
            linha: parseDRELine(row[0]),
            valores,
            analiseVertical: row[row.length-1] || ''
          });
        }
        return result;
      };

      const caixaMensal = parseDREMensalSheet(sheetCaixaMensal);
      const competenciaMensal = parseDREMensalSheet(sheetCompetenciaMensal);
      const caixaAcumulado = parseDREAcumuladoSheet(sheetCaixaAcumulado);
      const competenciaAcumulado = parseDREAcumuladoSheet(sheetCompetenciaAcumulado);

      // Validação final dos dados
      if (!caixaMensal.length && !competenciaMensal.length) {
        setError('❌ Não foi possível extrair dados mensais válidos. Verifique o preenchimento das abas.');
        return;
      }
      if (!caixaAcumulado.length && !competenciaAcumulado.length) {
        setError('❌ Não foi possível extrair dados acumulados válidos. Verifique o preenchimento das abas.');
        return;
      }

      setDreData({
        regimeCaixa: {
          mensal: caixaMensal,
          acumulado: caixaAcumulado
        },
        regimeCompetencia: {
          mensal: competenciaMensal,
          acumulado: competenciaAcumulado
        },
        ano: typeof caixaMensal[0]?.ano === 'number' ? caixaMensal[0].ano : 2025,
        empresa: caixaMensal[0]?.empresa || ''
      });

    } catch (err: any) {
      setError('❌ ' + (err.message || 'Erro ao importar arquivo'));
    } finally {
      setLoading(false);
    }
  };

  const carregarDREMensal = carregarDRECompleto;
  const carregarDREAcumulado = carregarDRECompleto;

  const setDados = (data: DREData) => {
    setDreData(data);
  };

  return (
    <DREContext.Provider value={{
      dreData,
      loading,
      error,
      anoSelecionado,
      mesSelecionado,
      regimeSelecionado,
      periodoInicio,
      periodoFim,
      setAnoSelecionado,
      setMesSelecionado,
      setRegimeSelecionado,
      setPeriodoInicio,
      setPeriodoFim,
      carregarDREMensal,
      carregarDREAcumulado,
      setDados
    }}>
      {children}
    </DREContext.Provider>
  );
};

export const useDRE = () => {
  const context = useContext(DREContext);
  if (!context) throw new Error('useDRE must be used within DREProvider');
  return context;
};
