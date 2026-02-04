
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { KPIData } from '../types';

const KPICard: React.FC<KPIData> = ({ label, value, trend, icon, iconColor }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isPositive = trend >= 0;

  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 flex flex-col gap-4 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all group">
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-xl bg-background-dark border border-border-dark">
          <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${isPositive
            ? 'text-primary bg-primary/10 border-primary/20'
            : 'text-red-400 bg-red-400/10 border-red-400/20'
          }`}>
          {isPositive ? '+' : ''}{trend}%
          <span className="material-symbols-outlined text-sm">
            {isPositive ? 'trending_up' : 'trending_down'}
          </span>
        </span>
      </div>
      <div>
        <p className={`${isDark ? 'text-text-muted' : 'text-gray-900'} text-sm font-medium`}>{label}</p>
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold mt-1`}>{value}</h3>
      </div>
    </div>
  );
};

export default KPICard;
