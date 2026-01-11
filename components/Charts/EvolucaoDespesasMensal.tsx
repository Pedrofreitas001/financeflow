
import React from 'react';
import { useDespesas } from '../../context/DespesasContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const EvolucaoDespesasMensal: React.FC = () => {
    const { agregadoDespesasMensal } = useDespesas();
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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4 shadow-2xl">
                    <p className="text-white font-bold mb-2">{label}</p>
                    <p className="text-primary text-lg font-bold">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    // Calcular variação percentual
    const calcularVariacao = () => {
        if (agregadoDespesasMensal.length < 2) return 0;
        const ultimo = agregadoDespesasMensal[agregadoDespesasMensal.length - 1].total;
        const penultimo = agregadoDespesasMensal[agregadoDespesasMensal.length - 2].total;
        return penultimo > 0 ? ((ultimo - penultimo) / penultimo) * 100 : 0;
    };

    const variacao = calcularVariacao();
    const totalPeriodo = agregadoDespesasMensal.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold">Evolução Mensal de Despesas</h3>
                    <p className="text-text-muted text-sm mt-1">Tendência ao longo do período selecionado</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
                </div>
            </div>

            {/* Métricas rápidas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">Total Período</p>
                    <p className="text-white text-lg font-bold">{formatCurrency(totalPeriodo)}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">Média Mensal</p>
                    <p className="text-white text-lg font-bold">
                        {formatCurrency(agregadoDespesasMensal.length > 0 ? totalPeriodo / agregadoDespesasMensal.length : 0)}
                    </p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">Variação MoM</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-lg font-bold ${variacao >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {variacao >= 0 ? '+' : ''}{variacao.toFixed(1)}%
                        </p>
                        <span className={`material-symbols-outlined text-sm ${variacao >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {variacao >= 0 ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={agregadoDespesasMensal} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e5e7eb'} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#0ebe54"
                            strokeWidth={3}
                            dot={{ fill: '#0ebe54', r: 6 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EvolucaoDespesasMensal;

