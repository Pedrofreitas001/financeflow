
import React from 'react';
import KPIGrid from './KPIGrid.tsx';
import DREWaterfall from './Charts/DREWaterfall.tsx';
import CashFlowChart from './Charts/CashFlowChart.tsx';
import ExpenseDonut from './Charts/ExpenseDonut.tsx';
import CompanyPerformance from './Charts/CompanyPerformance.tsx';
import ExecutiveDRE from './Charts/ExecutiveDRE.tsx';
import ExpenseEvolution from './Charts/ExpenseEvolution.tsx';
import { useFinance } from '../context/FinanceContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

const Dashboard: React.FC = () => {
  const { dados } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Se não houver dados, mostrar disclaimer
  if (dados.length === 0) {
    return (
      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-white'}`}>
        <div className={`flex-1 overflow-y-auto custom-scrollbar flex items-center justify-center relative`} style={{
          backgroundColor: '#0f1d32',
          backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59, 130, 246, 0.45) 0%, rgba(37, 99, 235, 0.25) 40%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.35) 0%, transparent 50%), radial-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 100% 100%, 24px 24px'
        }}>
          <div className="max-w-2xl w-full mx-auto px-8">
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <h2 data-cta-header style={{ color: '#ffffff !important', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Nenhum dado carregado
              </h2>
              <p data-cta-text style={{ color: '#d1d5db !important' }}>
                Importe um arquivo Excel com dados financeiros para visualizar
              </p>
            </div>

            {/* Informações do Formato */}
            <div className="rounded-2xl border border-gray-300 shadow-lg p-6 bg-white">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                <span className="material-symbols-outlined text-primary">description</span>
                Formato Esperado: Dashboard_Financeiro_Exemplo.xlsx
              </h3>
              <div className="rounded-lg p-4 mb-4 overflow-x-auto bg-gray-50">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-300">
                      <th className="text-left py-2">Coluna</th>
                      <th className="text-left py-2">Tipo</th>
                      <th className="text-left py-2">Exemplo</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Empresa</td>
                      <td>texto</td>
                      <td>Alpha, Beta, Gamma...</td>
                    </tr>
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Ano</td>
                      <td>número</td>
                      <td>2024, 2025...</td>
                    </tr>
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Mês</td>
                      <td>texto</td>
                      <td>Janeiro, Fevereiro, Março...</td>
                    </tr>
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Categoria</td>
                      <td>texto</td>
                      <td>Faturamento, Custo, Margem, Lucro...</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-primary">Valor</td>
                      <td>moeda (R$)</td>
                      <td>50000, 120000, 250000...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">Dashboard_Financeiro_Exemplo.xlsx</span></p>

              {/* Botão Download */}
              <a data-cta-button href="https://docs.google.com/spreadsheets/d/1QSr5027uyoLnYE-u9zzSIvJA01kTv9ciC9Ae1O5HywQ/export?format=xlsx" download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                <span className="material-symbols-outlined text-base">download</span>
                Baixar Arquivo
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <main id="dashboard-content" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full">
        {/* Cabeçalho da página */}
        <div>
          <h1 className="text-white text-3xl font-bold mb-2">Dashboard Financeiro</h1>
          <p className="text-text-muted">
            Acompanhe a performance financeira da sua empresa em tempo real
          </p>
        </div>

        {/* KPIs */}
        <KPIGrid />

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
          <ExecutiveDRE />
          <CashFlowChart />
        </div>

        {/* DRE Waterfall: Ocupa largura total */}
        <div id="pdf-section-waterfall" className="w-full">
          <DREWaterfall />
        </div>

        {/* Camada Inferior: Detalhamento */}
        <div id="pdf-section-bottom" className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
          <ExpenseDonut />
          <CompanyPerformance />
        </div>

        {/* Evolução das Despesas: Ocupa largura total */}
        <div id="pdf-section-expense-evolution" className="w-full pb-12">
          <ExpenseEvolution />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
