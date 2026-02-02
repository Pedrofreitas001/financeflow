
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';

const CompanyPerformance: React.FC = () => {
  const { agregadoEmpresa } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg flex flex-col h-[420px] w-full overflow-hidden">
      <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-base mb-6`}>Faturamento por Empresa</h3>
      <div className="flex flex-col gap-5 justify-center flex-1 overflow-y-auto custom-scrollbar px-1">
        {agregadoEmpresa.map((company, idx) => (
          <div key={company.name} className="space-y-1.5 group">
            <div className="flex justify-between text-[9px]">
              <span className={`${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} font-bold uppercase ${isDark ? 'group-hover:text-white' : 'group-hover:text-gray-900'} transition-colors`}>{company.name}</span>
              <span className="text-primary font-bold">{company.performance}%</span>
            </div>
            <div className={`w-full ${isDark ? 'bg-[#1c2720] border-[#3b5445]/20' : 'bg-gray-100 border-gray-300/50'} rounded-full h-2 overflow-hidden border`}>
              <div
                className="bg-gradient-to-r from-primary/60 to-primary h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${company.performance}%`,
                  opacity: 1 - (idx * 0.1)
                }}
              ></div>
            </div>
          </div>
        ))}
        {agregadoEmpresa.length === 0 && (
          <div className="text-center py-8">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#3b5445]' : 'text-gray-300'} text-3xl mb-2`}>business</span>
            <p className={`text-[10px] ${isDark ? 'text-[#9db9a8]' : 'text-gray-500'} italic uppercase font-bold`}>Sem dados no período</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPerformance;
