
import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WATERFALL_DATA } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

const WaterfallChart: React.FC = () => {
  const { theme } = useTheme();
  // Processing data for Waterfall effect in Recharts
  // We need to calculate the "bottom" or "start" value for each segment
  const processedData = WATERFALL_DATA.reduce((acc: any[], item, index) => {
    const prevTotal = index === 0 ? 0 : acc[index - 1].absoluteTotal;
    const currentTotal = prevTotal + item.value;
    
    acc.push({
      ...item,
      // The start value of the bar (transparent base)
      start: item.isTotal ? 0 : (item.value > 0 ? prevTotal : currentTotal),
      // The height of the colored part
      displayValue: Math.abs(item.value),
      absoluteTotal: currentTotal
    });
    return acc;
  }, []);

  const isDark = theme === 'dark';
  const colors = {
    gridStroke: isDark ? '#3b5445' : '#e5e7eb',
    tickFill: isDark ? '#9db9a8' : '#1a1a1a',
    tooltipBg: isDark ? '#1c2720' : '#ffffff',
    tooltipBorder: isDark ? '#3b5445' : '#d1d9d5',
  };

  return (
    <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445]' : 'bg-white border-gray-200'} border rounded-xl p-6 flex flex-col h-[400px]`}>
      <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-lg mb-6`}>Composição do Resultado (DRE) - Waterfall</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
            <CartesianGrid vertical={false} stroke={colors.gridStroke} strokeDasharray="3 3" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.tickFill, fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.tickFill, fontSize: 12 }} />
            <Tooltip
               contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
               formatter={(value: any, name: any, props: any) => [props.payload.value, 'Valor']}
            />
            {/* The transparent spacer bar */}
            <Bar dataKey="start" stackId="a" fill="transparent" />
            {/* The actual colored bar */}
            <Bar dataKey="displayValue" stackId="a">
              {processedData.map((entry, index) => {
                let color = '#0ebe54'; // Positive
                if (entry.isTotal) color = '#054d22'; // Final Result
                else if (entry.value < 0) {
                    if (entry.name === 'CMV') color = '#ef4444';
                    else if (entry.name === 'Desp. Ops') color = '#fb923c';
                    else color = '#eab308';
                }
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WaterfallChart;
