
import React from 'react';
import KPIGrid from './KPIGrid.tsx';
import DREWaterfall from './Charts/DREWaterfall.tsx';
import CashFlowChart from './Charts/CashFlowChart.tsx';
import ExpenseDonut from './Charts/ExpenseDonut.tsx';
import CompanyPerformance from './Charts/CompanyPerformance.tsx';
import ExecutiveDRE from './Charts/ExecutiveDRE.tsx';
import ExpenseEvolution from './Charts/ExpenseEvolution.tsx';
import { useDespesas } from '../context/DespesasContext.tsx';

const Dashboard: React.FC = () => {
  const { dadosDespesas } = useDespesas();

  // Se não houver dados, mostrar disclaimer
  if (dadosDespesas.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-24 h-24 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-5xl">dashboard</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Nenhum dado carregado</h2>
            <p className="text-text-muted mb-8">
              Carregue um arquivo Excel na barra lateral para visualizar o dashboard financeiro
            </p>

            {/* Formato Esperado */}
            <div className="bg-surface-dark rounded-xl border border-border-dark p-6 w-full max-w-2xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Formato Esperado: Excel Financeiro
              </h3>
              <div className="bg-background-dark rounded-lg p-4 mb-4 overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="text-text-muted border-b border-border-dark">
                      <th className="text-left py-2">Coluna</th>
                      <th className="text-left py-2">Tipo</th>
                      <th className="text-left py-2">Exemplo</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-border-dark/50">
                      <td className="py-2 font-mono text-primary">Ano</td>
                      <td>número</td>
                      <td>2024, 2025...</td>
                    </tr>
                    <tr className="border-b border-border-dark/50">
                      <td className="py-2 font-mono text-primary">Mes</td>
                      <td>texto</td>
                      <td>Janeiro, Fevereiro...</td>
                    </tr>
                    <tr className="border-b border-border-dark/50">
                      <td className="py-2 font-mono text-primary">Categoria</td>
                      <td>texto</td>
                      <td>Faturamento, Custo Variável...</td>
                    </tr>
                    <tr className="border-b border-border-dark/50">
                      <td className="py-2 font-mono text-primary">Empresa</td>
                      <td>texto</td>
                      <td>Alpha, Beta, Gamma...</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-primary">Valor</td>
                      <td>número (R$)</td>
                      <td>50000, 120000...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-text-muted">Faça upload na barra lateral para visualizar gráficos e relatórios</p>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main id="dashboard-content" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full">
        {/* Camada Superior: KPIs */}
        <KPIGrid />

        {/* Camada Central: Gráficos de Visão Geral */}
        <div id="pdf-section-middle" className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
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
