
import React from 'react';
import { useDespesas } from '../../context/DespesasContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const DespesasPorCategoria: React.FC = () => {
    const { agregadoDespesasCategoria } = useDespesas();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4 shadow-2xl">
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold mb-1`}>{payload[0].payload.name}</p>
                    <p className="text-primary text-lg font-bold">{formatCurrency(payload[0].value)}</p>
                    <p className={`${isDark ? 'text-text-muted' : 'text-gray-600'} text-sm`}>{payload[0].payload.percentage}% do total</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} text-lg font-bold`}>Despesas por Categoria</h3>
                    <p className={`${isDark ? 'text-text-muted' : 'text-gray-600'} text-sm mt-1`}>Distribuição dos gastos por tipo</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">category</span>
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agregadoDespesasCategoria} margin={{ top: 20, right: 30, left: 50, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c2720' : '#e5e7eb'} />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fill: isDark ? '#9db9a8' : '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fill: isDark ? '#9db9a8' : '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                            width={75}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                            isAnimationActive
                            animationBegin={120}
                            animationDuration={850}
                            animationEasing="ease-out"
                        >
                            {agregadoDespesasCategoria.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legenda com valores */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                {agregadoDespesasCategoria.slice(0, 6).map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-background-dark rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                            <span className={`${isDark ? 'text-text-muted' : 'text-gray-600'} text-xs font-medium truncate`}>{cat.name}</span>
                        </div>
                        <div className="text-right">
                            <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-bold`}>{cat.percentage}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DespesasPorCategoria;



