
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { DadosFinanceiros, KPIs } from '../types.ts';
import { limparValor, getMesNumero } from '../utils/financeUtils.ts';
import { loadSavedDashboard } from '@/utils/savedDashboardManager';
import { supabase } from '@/lib/supabase';

interface FinanceContextType {
  dados: DadosFinanceiros[];
  empresas: string[];
  mesesDisponiveis: string[];
  filtros: {
    empresa: string;
    meses: string[];
  };
  setFiltroEmpresa: (empresa: string) => void;
  setFiltroMeses: (meses: string[]) => void;
  carregarDados: (json: any[]) => void;
  dadosFiltrados: DadosFinanceiros[];
  kpis: KPIs;
  agregadoMensal: any[];
  agregadoCategoria: any[];
  agregadoEmpresa: any[];
  uploadDate: string | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dados, setDados] = useState<DadosFinanceiros[]>([]);
  const [filtros, setFiltros] = useState({ empresa: 'Todas', meses: [] as string[] });
  const [uploadDate, setUploadDate] = useState<string | null>(null);

  const carregarDados = (json: any[]) => {
    try {
      if (!Array.isArray(json)) {
        console.error('[FinanceContext] Dados não é um array');
        setDados([]);
        return;
      }

      const dadosValidos = json.filter(row => {
        try {
          const ano = row?.Ano ?? row?.ano;
          const mes = row?.Mes ?? row?.mes;
          const categoria = row?.Categoria ?? row?.categoria;
          const empresa = row?.Empresa ?? row?.empresa;
          const valor = row?.Valor ?? row?.valor;
          return row && ano && mes && categoria && empresa && valor !== undefined;
        } catch {
          return false;
        }
      });

      if (dadosValidos.length === 0) {
        console.warn('[FinanceContext] Nenhum dado válido encontrado');
        setDados([]);
        setFiltros({ empresa: 'Todas', meses: [] });
        return;
      }

      const processados: DadosFinanceiros[] = dadosValidos.map(row => {
        try {
          const mesValue = row?.Mes ?? row?.mes;
          const mesStr = String(mesValue).trim();
          const mesNum = getMesNumero(mesStr);

          const anoRaw = row?.Ano ?? row?.ano;
          const anoParsed = parseInt(String(anoRaw));
          const anoFinal = Number.isNaN(anoParsed) ? 2024 : anoParsed;

          return {
            ano: anoFinal,
            mes: mesStr,
            mesNum: mesNum,
            categoria: String((row?.Categoria ?? row?.categoria) ?? ""),
            empresa: String((row?.Empresa ?? row?.empresa) ?? ""),
            valor: limparValor(row?.Valor ?? row?.valor),
            data: new Date(anoFinal, mesNum - 1, 1)
          };
        } catch (err) {
          console.error('[FinanceContext] Erro ao processar linha:', row, err);
          return null;
        }
      }).filter((d): d is DadosFinanceiros => d !== null && d.categoria && d.mes);

      if (processados.length === 0) {
        console.warn('[FinanceContext] Nenhum dado pôde ser processado');
        setDados([]);
        setFiltros({ empresa: 'Todas', meses: [] });
        return;
      }

      setDados(processados);
      const uniqueMeses = Array.from(new Set(processados.map(d => d.mes))).sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));
      setFiltros({ empresa: 'Todas', meses: uniqueMeses });

      // Armazena a data de upload
      const now = new Date();
      const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setUploadDate(formattedDate);
    } catch (error) {
      console.error('[FinanceContext] Erro ao carregar dados:', error);
      setDados([]);
      setFiltros({ empresa: 'Todas', meses: [] });
    }
  };

  const empresas = useMemo(() => ['Todas', ...Array.from(new Set(dados.map(d => d.empresa)))], [dados]);
  const mesesDisponiveis = useMemo(() => {
    return Array.from(new Set(dados.map(d => d.mes))).sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));
  }, [dados]);

  const dadosFiltrados = useMemo(() => {
    return dados.filter(d =>
      (filtros.empresa === 'Todas' || d.empresa === filtros.empresa) &&
      (filtros.meses.length === 0 || filtros.meses.includes(d.mes))
    );
  }, [dados, filtros]);

  // Agregações Dinâmicas
  const agregadoMensal = useMemo(() => {
    const meses = Array.from(new Set(dadosFiltrados.map(d => d.mes))).sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));
    return meses.map(m => {
      const mesDados = dadosFiltrados.filter(d => d.mes === m);
      const entrada = mesDados.filter(d => d.categoria.toUpperCase().includes("FATURAMENTO")).reduce((acc, curr) => acc + curr.valor, 0);
      const saida = mesDados.filter(d => d.categoria.toUpperCase().includes("CUSTO") || d.categoria.toUpperCase().includes("GASTO") || d.categoria.toUpperCase().includes("IMPOSTO")).reduce((acc, curr) => acc + curr.valor, 0);
      return { month: m, inflow: entrada, outflow: Math.abs(saida) };
    });
  }, [dadosFiltrados]);

  const agregadoCategoria = useMemo(() => {
    const categorias = ["Custo Variável", "Custo Fixo (R$)", "Imposto Variável", "Marketing", "Pessoal"];
    const cores = ["#ef4444", "#f97316", "#ec4899", "#3b82f6", "#0ebe54"];

    const result = categorias.map((cat, i) => {
      const valor = Math.abs(dadosFiltrados.filter(d => d.categoria.toUpperCase().includes(cat.toUpperCase())).reduce((acc, curr) => acc + curr.valor, 0));
      return { name: cat, value: valor, color: cores[i % cores.length] };
    }).filter(c => c.value > 0);

    const total = result.reduce((acc, curr) => acc + curr.value, 0);
    return result.map(c => ({ ...c, percentage: total > 0 ? Math.round((c.value / total) * 100) : 0 }));
  }, [dadosFiltrados]);

  const agregadoEmpresa = useMemo(() => {
    const emps = Array.from(new Set(dadosFiltrados.map(d => d.empresa)));
    const maxVal = Math.max(...emps.map(e => dadosFiltrados.filter(d => d.empresa === e && d.categoria.toUpperCase().includes("FATURAMENTO")).reduce((acc, curr) => acc + curr.valor, 0)), 1);

    return emps.map(e => {
      const receita = dadosFiltrados.filter(d => d.empresa === e && d.categoria.toUpperCase().includes("FATURAMENTO")).reduce((acc, curr) => acc + curr.valor, 0);
      return { name: e, performance: Math.round((receita / maxVal) * 100) };
    }).sort((a, b) => b.performance - a.performance);
  }, [dadosFiltrados]);

  const kpis = useMemo((): KPIs => {
    const sumCat = (cat: string) => dadosFiltrados
      .filter(d => d.categoria.toUpperCase().includes(cat.toUpperCase()))
      .reduce((acc, curr) => acc + curr.valor, 0);

    const faturamentoBruto = sumCat("Faturamento Bruto");
    const faturamentoLiquido = sumCat("Faturamento Líquido");
    const custoVariavel = sumCat("Custo Variável");
    const custoFixo = sumCat("Custo Fixo (R$)");
    const margemContribuicao = faturamentoLiquido - Math.abs(custoVariavel);
    const resultado = sumCat("RESULTADO (R$)");

    return {
      faturamentoBruto,
      faturamentoLiquido,
      custoVariavel,
      custoFixo,
      margemContribuicao,
      margemContribuicaoPerc: faturamentoBruto > 0 ? (margemContribuicao / faturamentoBruto) * 100 : 0,
      resultado,
      margemLiquida: faturamentoLiquido > 0 ? (resultado / faturamentoLiquido) * 100 : 0
    };
  }, [dadosFiltrados]);

  return (
    <FinanceContext.Provider value={{
      dados, empresas, mesesDisponiveis, filtros,
      setFiltroEmpresa: (e) => setFiltros(f => ({ ...f, empresa: e })),
      setFiltroMeses: (m) => setFiltros(f => ({ ...f, meses: m })),
      carregarDados, dadosFiltrados, kpis,
      agregadoMensal, agregadoCategoria, agregadoEmpresa,
      uploadDate
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
