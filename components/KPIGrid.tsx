
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBRL } from '../utils/financeUtils';

const KPIGrid: React.FC = () => {
  const { kpis } = useFinance();

  const metrics = [
    { 
      label: 'Faturamento Líquido', 
      value: formatBRL(kpis.faturamentoLiquido), 
      trend: '+12.5%', 
      isPositive: true, 
      icon: 'wallet', 
      color: '#0ebe54' 
    },
    { 
      label: 'Margem Contribuição', 
      value: formatBRL(kpis.margemContribuicao), 
      trend: '+5.2%', 
      isPositive: true, 
      icon: 'donut_large', 
      color: '#3b82f6' 
    },
    { 
      label: 'Resultado (R$)', 
      value: formatBRL(kpis.resultado), 
      trend: kpis.resultado >= 0 ? '+2.1%' : '-2.1%', 
      isPositive: kpis.resultado >= 0, 
      icon: 'analytics', 
      color: kpis.resultado >= 0 ? '#0ebe54' : '#ef4444' 
    },
    { 
      label: 'Margem Contrib. %', 
      value: `${kpis.margemContribuicaoPerc.toFixed(1)}%`, 
      trend: '+1.5%', 
      isPositive: true, 
      icon: 'percent', 
      color: '#eab308' 
    },
  ];

  return (
    <div id="pdf-section-kpis" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-1">
      {metrics.map((m, i) => (
        <div key={i} className="border border-[#3b5445] rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#111814] flex items-center justify-center border border-[#3b5445]">
              <span className="material-symbols-outlined text-[16px]" style={{ color: m.color }}>{m.icon}</span>
            </div>
            <div className={`flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${
              m.isPositive 
                ? 'text-primary bg-primary/10 border-primary/20' 
                : 'text-red-400 bg-red-400/10 border-red-400/20'
            }`}>
              {m.trend}
            </div>
          </div>
          <div>
            <p className="text-[#9db9a8] text-[8px] font-bold uppercase tracking-widest mb-0.5 opacity-80">{m.label}</p>
            <h3 className="text-lg font-bold text-white tabular-nums tracking-tight">{m.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIGrid;
