export interface PdfSection {
  id: string;
  label: string;
  defaultSelected: boolean;
}

export interface PdfTabConfig {
  title: string;
  fileName: string;
  sections: PdfSection[];
}

export const pdfTabConfigs: Record<string, PdfTabConfig> = {
  dashboard: {
    title: 'Dashboard Financeiro',
    fileName: 'Dashboard_Financeiro',
    sections: [
      { id: 'pdf-section-kpis', label: 'KPIs Financeiros', defaultSelected: true },
      { id: 'pdf-section-middle', label: 'DRE Executivo & Fluxo de Caixa', defaultSelected: true },
      { id: 'pdf-section-waterfall', label: 'Waterfall DRE', defaultSelected: true },
      { id: 'pdf-section-bottom', label: 'Despesas por Categoria & Performance', defaultSelected: true },
      { id: 'pdf-section-expense-evolution', label: 'Evolução das Despesas', defaultSelected: true },
    ],
  },
  despesas: {
    title: 'Análise de Despesas',
    fileName: 'Analise_Despesas',
    sections: [
      { id: 'pdf-section-kpis-despesas', label: 'KPIs de Despesas', defaultSelected: true },
      { id: 'pdf-section-despesas-charts', label: 'Evolução Mensal & Por Categoria', defaultSelected: true },
      { id: 'pdf-section-despesas-comparacao', label: 'Comparação de Períodos', defaultSelected: true },
      { id: 'pdf-section-despesas-tabela', label: 'Tabela Plano de Contas', defaultSelected: true },
    ],
  },
  dre: {
    title: 'Tabelas DRE',
    fileName: 'Tabelas_DRE',
    sections: [
      { id: 'pdf-section-dre-filters', label: 'Filtros e Visão', defaultSelected: false },
      { id: 'pdf-section-dre-table', label: 'Tabela DRE', defaultSelected: true },
    ],
  },
  cashflow: {
    title: 'Fluxo de Caixa',
    fileName: 'Fluxo_Caixa',
    sections: [
      { id: 'pdf-section-cashflow-kpis', label: 'KPIs do Fluxo de Caixa', defaultSelected: true },
      { id: 'pdf-section-cashflow-charts', label: 'Receitas vs Despesas & Evolução do Saldo', defaultSelected: true },
      { id: 'pdf-section-cashflow-tabela', label: 'Detalhamento de Contas', defaultSelected: true },
    ],
  },
  indicadores: {
    title: 'Indicadores Financeiros',
    fileName: 'Indicadores_Financeiros',
    sections: [
      { id: 'pdf-section-indicadores-kpis', label: 'KPIs de Indicadores', defaultSelected: true },
      { id: 'pdf-section-indicadores-charts', label: 'Evolução de Indicadores & Saúde Geral', defaultSelected: true },
      { id: 'pdf-section-indicadores-tabela', label: 'Tabela de Detalhamento', defaultSelected: true },
    ],
  },
  orcamento: {
    title: 'Orçamento',
    fileName: 'Orcamento',
    sections: [
      { id: 'pdf-section-orcamento-kpis', label: 'KPIs de Orçamento', defaultSelected: true },
      { id: 'pdf-section-orcamento-charts', label: 'Orçado vs Realizado & Variância', defaultSelected: true },
      { id: 'pdf-section-orcamento-desvios', label: 'Desvios Críticos', defaultSelected: true },
      { id: 'pdf-section-orcamento-tabela', label: 'Detalhamento Completo', defaultSelected: true },
    ],
  },
  balancete: {
    title: 'Balancete Contábil',
    fileName: 'Balancete',
    sections: [
      { id: 'pdf-section-balancete-kpis', label: 'Indicadores Principais', defaultSelected: true },
      { id: 'pdf-section-balancete-charts', label: 'Gráficos de Distribuição', defaultSelected: true },
      { id: 'pdf-section-balancete-snapshot', label: 'Snapshot Executivo', defaultSelected: true },
      { id: 'pdf-section-balancete-mapa', label: 'Mapa Patrimonial', defaultSelected: true },
      { id: 'pdf-section-balancete-piramide', label: 'Pirâmide de Solidez', defaultSelected: false },
      { id: 'pdf-section-balancete-ranking', label: 'Ranking de Contas', defaultSelected: false },
      { id: 'pdf-section-balancete-tabela', label: 'Tabela de Balancete', defaultSelected: true },
    ],
  },
};
