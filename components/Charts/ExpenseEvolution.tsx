import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { getMesNumero } from '../../utils/financeUtils';

type MetricType = 'custoVariavel' | 'custoFixo' | 'impostoVariavel' | 'total';

const ExpenseEvolution: React.FC = () => {
  const { dadosFiltrados } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('total');

  const colors = {
    gridStroke: isDark ? '#3b5445' : '#e5e7eb',
    tickFill: isDark ? '#9db9a8' : '#1a1a1a',
    tooltipBg: isDark ? '#1c2720' : '#ffffff',
    tooltipBorder: isDark ? '#3b5445' : '#d1d9d5',
    tooltipText: isDark ? '#fff' : '#1a1a1a',
  };

  const chartData = useMemo(() => {
    const meses = Array.from(new Set(dadosFiltrados.map(d => d.mes)))
      .sort((a: string, b: string) => getMesNumero(a) - getMesNumero(b));

    return meses.map(m => {
      const mesDados = dadosFiltrados.filter(d => d.mes === m);

      const custoVariavel = Math.abs(
        mesDados.filter(d => d.categoria.toUpperCase().includes("CUSTO VARIÁVEL"))
          .reduce((acc, curr) => acc + curr.valor, 0)
      );

      const custoFixo = Math.abs(
        mesDados.filter(d => d.categoria.toUpperCase().includes("CUSTO FIXO"))
          .reduce((acc, curr) => acc + curr.valor, 0)
      );

      const impostoVariavel = Math.abs(
        mesDados.filter(d => d.categoria.toUpperCase().includes("IMPOSTO VARIÁVEL"))
          .reduce((acc, curr) => acc + curr.valor, 0)
      );

      const total = custoVariavel + custoFixo + impostoVariavel;

      return {
        month: m,
        custoVariavel,
        custoFixo,
        impostoVariavel,
        total,
      };
    });
  }, [dadosFiltrados]);

  const metrics = [
    { key: 'custoVariavel' as MetricType, label: 'Custo Variável', color: '#ef4444' },
    { key: 'custoFixo' as MetricType, label: 'Custo Fixo', color: '#f97316' },
    { key: 'impostoVariavel' as MetricType, label: 'Imposto Variável', color: '#ec4899' },
    { key: 'total' as MetricType, label: 'Total', color: '#3b82f6' },
  ];

  const currentMetric = metrics.find(m => m.key === selectedMetric)!;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}mi`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toFixed(0);
  };

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg flex flex-col h-[420px] w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-base`}>Evolução das Despesas</h3>

        <div className="flex gap-2">
          {metrics.map(metric => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMetric === metric.key
                  ? `${isDark ? 'bg-primary/20 text-primary border-primary' : 'bg-primary/10 text-primary border-primary'} border`
                  : `${isDark ? 'bg-[#111814] text-[#9db9a8] border-[#3b5445] hover:border-primary/50' : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-primary/50'} border`
                }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={colors.gridStroke} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fill: colors.tickFill, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: colors.tickFill, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                color: colors.tooltipText,
              }}
              formatter={(value: any) => [formatBRL(value), currentMetric.label]}
            />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentMetric.color}
              strokeWidth={3}
              dot={{ fill: currentMetric.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseEvolution;
