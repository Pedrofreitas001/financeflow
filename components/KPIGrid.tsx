
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { formatBRL } from '../utils/financeUtils';

const KPIGrid: React.FC = () => {
  const { kpis } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div id="pdf-section-kpis" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {metrics.map((m, i) => (
        <div key={i} className="bg-surface-dark border border-border-dark rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:border-primary/50 group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-background-dark border border-border-dark flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl" style={{ color: m.color }}>{m.icon}</span>
            </div>
          </div>
          <div>
            <p className={`${isDark ? 'text-text-muted' : 'text-gray-900'} text-xs font-medium mb-1 uppercase tracking-wide`}>
              {m.label}
            </p>
            <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold tracking-tight`}>
              {m.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIGrid;
