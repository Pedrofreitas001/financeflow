
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

  // Se não houver dados, mostrar mensagem
  if (dadosDespesas.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-5xl">dashboard</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Bem-vindo ao Dashboard Contábil</h2>
            <p className="text-text-muted mb-6 max-w-md">
              Para começar, carregue dados em uma das seções de análise na barra lateral
            </p>
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
