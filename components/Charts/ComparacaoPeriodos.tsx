
import React, { useState } from 'react';
import { useDespesas } from '../../context/DespesasContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ComparacaoPeriodos: React.FC = () => {
    const { agregadoDespesasMensal, dadosDespesasFiltrados, categoriasDisponiveis } = useDespesas();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [categoriaComparacao, setCategoriaComparacao] = useState<string>('Todas');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Preparar dados para comparação
    const dadosComparacao = React.useMemo(() => {
        if (!agregadoDespesasMensal.length) return [];

        // Se houver pelo menos 6 meses, comparar primeiro semestre vs segundo semestre
        if (agregadoDespesasMensal.length >= 6) {
            const meio = Math.floor(agregadoDespesasMensal.length / 2);
            const periodo1 = agregadoDespesasMensal.slice(0, meio);
            const periodo2 = agregadoDespesasMensal.slice(meio);

            return periodo1.map((item, index) => {
                const dadosP1 = categoriaComparacao === 'Todas'
                    ? item.total
                    : dadosDespesasFiltrados
                        .filter(d => d.mes === item.month && d.categoria === categoriaComparacao)
                        .reduce((acc, curr) => acc + curr.valor, 0);

                const dadosP2 = periodo2[index]
                    ? (categoriaComparacao === 'Todas'
                        ? periodo2[index].total
                        : dadosDespesasFiltrados
                            .filter(d => d.mes === periodo2[index].month && d.categoria === categoriaComparacao)
                            .reduce((acc, curr) => acc + curr.valor, 0))
                    : 0;

                return {
                    month: `Mês ${index + 1}`,
                    periodo1: dadosP1,
                    periodo2: dadosP2
                };
            });
        }

        return [];
    }, [agregadoDespesasMensal, categoriaComparacao, dadosDespesasFiltrados]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4 shadow-2xl">
                    <p className="text-white font-bold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <span className="text-text-muted text-sm">{entry.name}:</span>
                            <span className="text-primary font-bold">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Calcular totais e variação
    const total1 = dadosComparacao.reduce((acc, curr) => acc + curr.periodo1, 0);
    const total2 = dadosComparacao.reduce((acc, curr) => acc + curr.periodo2, 0);
    const variacao = total1 > 0 ? ((total2 - total1) / total1) * 100 : 0;

    if (agregadoDespesasMensal.length < 6) {
        return (
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-white text-lg font-bold">Comparação de Períodos</h3>
                        <p className="text-text-muted text-sm mt-1">Compare despesas entre diferentes períodos</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">compare_arrows</span>
                    </div>
                </div>
                <div className="flex items-center justify-center h-64 bg-background-dark rounded-xl">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-text-muted text-5xl mb-3">calendar_month</span>
                        <p className="text-text-muted">Selecione pelo menos 6 meses para comparação</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold">Comparação de Períodos</h3>
                    <p className="text-text-muted text-sm mt-1">1º vs 2º período do intervalo selecionado</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">compare_arrows</span>
                </div>
            </div>

            {/* Filtro de categoria */}
            <div className="mb-6">
                <label className="text-sm text-text-muted mb-2 block">Categoria para Comparação</label>
                <select
                    value={categoriaComparacao}
                    onChange={(e) => setCategoriaComparacao(e.target.value)}
                    className="w-full max-w-xs rounded-xl bg-background-dark border border-border-dark text-white p-3 text-sm focus:ring-primary"
                >
                    <option value="Todas">Todas as Categorias</option>
                    {categoriasDisponiveis.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Métricas de comparação */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">1º Período</p>
                    <p className="text-blue-400 text-lg font-bold">{formatCurrency(total1)}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">2º Período</p>
                    <p className="text-purple-400 text-lg font-bold">{formatCurrency(total2)}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">Variação</p>
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
                    <LineChart data={dadosComparacao} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e5e7eb'} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                        />
                        <YAxis
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => value === 'periodo1' ? '1º Período' : '2º Período'}
                        />
                        <Line
                            type="monotone"
                            dataKey="periodo1"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5 }}
                            name="periodo1"
                        />
                        <Line
                            type="monotone"
                            dataKey="periodo2"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', r: 5 }}
                            name="periodo2"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ComparacaoPeriodos;

