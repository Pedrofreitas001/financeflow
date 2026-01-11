
export interface DadosFinanceiros {
  ano: number;
  mes: string;
  mesNum: number;
  categoria: string;
  empresa: string;
  valor: number;
  data: Date;
}

export interface DadosDespesas {
  ano: number;
  mes: string;
  mesNum: number;
  empresa: string;
  categoria: string;
  subcategoria: string;
  valor: number;
  data: Date;
  tipo?: string;
}

export interface KPIs {
  faturamentoBruto: number;
  faturamentoLiquido: number;
  custoVariavel: number;
  custoFixo: number;
  margemContribuicao: number;
  margemContribuicaoPerc: number;
  resultado: number;
  margemLiquida: number;
}

export interface KPIDespesas {
  totalDespesas: number;
  totalDespesasFixas: number;
  totalDespesasVariaveis: number;
  ticketMedio: number;
  despesasPendentes: number;
  percentualFaturamento: number;
}

export interface KPIData {
  label: string;
  value: string;
  trend: number;
  icon: string;
  iconColor: string;
}

export interface CashFlowData {
  month: string;
  inflow: number;
  outflow: number;
}

export interface WaterfallData {
  name: string;
  value: number;
  isTotal?: boolean;
}

export interface CompanyPerformance {
  name: string;
  performance: number;
}

export interface ExpenseCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ExpenseEvolution {
  month: string;
  categoria: string;
  valor: number;
}

export interface DespesaComparacao {
  mes: string;
  mesNum: number;
  valor: number;
}

// Novos tipos para o Chat
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
