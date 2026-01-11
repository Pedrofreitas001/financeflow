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
}

const DREContext = createContext<DREContextType | undefined>(undefined);

const mesMap: {[key: string]: number} = {
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

      if (!sheetCaixaMensal || !sheetCompetenciaMensal || !sheetCaixaAcumulado || !sheetCompetenciaAcumulado) {
        throw new Error('Planilha deve conter as 4 abas: "Regime de Caixa", "Regime de Competência", "Regime de Caixa Enxuto" e "Regime de Competência Enxuto"');
      }

      const parseDREMensalSheet = (sheet: any): DREMensal[] => {
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
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
        const result: DREAcumulado[] = [];

        for (let i = 2; i < data.length; i++) {
          const row = data[i];
          if (!row[0]) continue;

          result.push({
            linha: parseDRELine(row[0]),
            valores: {
              jan: parseNumero(row[1]),
              fev: parseNumero(row[2]),
              mar: parseNumero(row[3]),
              abr: parseNumero(row[4]),
              mai: parseNumero(row[5]),
              jun: parseNumero(row[6]),
              jul: parseNumero(row[7]),
              ago: parseNumero(row[8]),
              set: parseNumero(row[9]),
              out: parseNumero(row[10]),
              nov: parseNumero(row[11]),
              total: parseNumero(row[12])
            },
            analiseVertical: row[13] || ''
          });
        }

        return result;
      };

      const caixaMensal = parseDREMensalSheet(sheetCaixaMensal);
      const competenciaMensal = parseDREMensalSheet(sheetCompetenciaMensal);
      const caixaAcumulado = parseDREAcumuladoSheet(sheetCaixaAcumulado);
      const competenciaAcumulado = parseDREAcumuladoSheet(sheetCompetenciaAcumulado);

      setDreData({
        regimeCaixa: {
          mensal: caixaMensal,
          acumulado: caixaAcumulado
        },
        regimeCompetencia: {
          mensal: competenciaMensal,
          acumulado: competenciaAcumulado
        },
        ano: anoSelecionado,
        empresa: 'Bonaliment Alimentação'
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarDREMensal = carregarDRECompleto;
  const carregarDREAcumulado = carregarDRECompleto;

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
      carregarDREAcumulado
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
