
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { formatBRL } from '../../utils/financeUtils';

const ExecutiveDRE: React.FC = () => {
  const { kpis } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const dreItems = [
    { label: 'Faturamento Bruto', value: kpis.faturamentoBruto, color: 'bg-primary' },
    { label: 'Custo Variável', value: Math.abs(kpis.custoVariavel), color: 'bg-red-500/80' },
    { label: 'Margem Contribuição', value: kpis.margemContribuicao, color: 'bg-[#3b82f6]' },
    { label: 'Resultado Final', value: kpis.resultado, color: kpis.resultado >= 0 ? 'bg-emerald-600' : 'bg-red-500' },
  ];

  const maxValue = Math.max(...dreItems.map(i => Math.abs(i.value)), 1);

  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg flex flex-col h-[420px] w-full">
      <div className="flex justify-between items-center mb-10 shrink-0">
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-base`}>Visão Executiva (DRE)</h3>
        <span className={`text-[9px] ${isDark ? 'text-[#9db9a8]' : 'text-gray-500'} uppercase tracking-wider font-bold`}>Proporcional</span>
      </div>

      <div className="flex flex-col gap-10 justify-center flex-1 pr-1">
        {dreItems.map((item) => {
          const absValue = Math.abs(item.value);
          const percentage = Math.min((absValue / maxValue) * 100, 100);
          return (
            <div key={item.label} className="flex flex-col">
              <div className="flex justify-between items-end mb-3">
                <span className={`text-[11px] font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-widest`}>{item.label}</span>
                <span className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-gray-900'} whitespace-nowrap`}>{formatBRL(item.value)}</span>
              </div>

              <div className={`w-full ${isDark ? 'bg-[#111814] border-[#3b5445]' : 'bg-gray-100 border-gray-300'} rounded-full h-4 overflow-hidden border`}>
                <div
                  className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutiveDRE;
