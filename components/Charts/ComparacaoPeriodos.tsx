import React, { useState } from 'react';
import { useDespesas } from '../../context/DespesasContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ComparacaoPeriodos: React.FC = () => {
    const { dadosDespesas, empresasDespesas, categoriasDisponiveis } = useDespesas();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [tipoComparacao, setTipoComparacao] = useState<'anos' | 'empresas'>('anos');
    const [categoriaComparacao, setCategoriaComparacao] = useState<string>(categoriasDisponiveis[0] || '');
    const [ano1, setAno1] = useState<number>(2024);
    const [ano2, setAno2] = useState<number>(2025);
    const [empresa1, setEmpresa1] = useState<string>(empresasDespesas[1] || '');
    const [empresa2, setEmpresa2] = useState<string>(empresasDespesas[2] || '');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Extrair anos disponíveis
    const anosDisponiveis = React.useMemo(() => {
        const anos = Array.from(new Set(dadosDespesas.map(d => d.ano))).sort((a, b) => a - b);
        return anos.length > 0 ? anos : [2024, 2025];
    }, [dadosDespesas]);

    // Preparar dados para comparação
    const dadosComparacao = React.useMemo(() => {
        const meses = Array.from(new Set(dadosDespesas.map(d => d.mes)))
            .sort((a, b) => {
                const ordem: { [key: string]: number } = {
                    'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
                    'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
                    'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
                };
                return (ordem[a] || 0) - (ordem[b] || 0);
            });

        if (tipoComparacao === 'anos' && !categoriaComparacao) return [];
        if (tipoComparacao === 'empresas' && (!empresa1 || !empresa2)) return [];

        return meses.map(mes => {
            let valor1 = 0;
            let valor2 = 0;
            const label1 = tipoComparacao === 'anos' ? `${ano1}` : empresa1;
            const label2 = tipoComparacao === 'anos' ? `${ano2}` : empresa2;

            if (tipoComparacao === 'anos') {
                valor1 = dadosDespesas
                    .filter(d =>
                        d.ano === ano1 &&
                        d.mes === mes &&
                        d.categoria === categoriaComparacao &&
                        d.tipo === 'despesa'
                    )
                    .reduce((acc, curr) => acc + curr.valor, 0);

                valor2 = dadosDespesas
                    .filter(d =>
                        d.ano === ano2 &&
                        d.mes === mes &&
                        d.categoria === categoriaComparacao &&
                        d.tipo === 'despesa'
                    )
                    .reduce((acc, curr) => acc + curr.valor, 0);
            } else {
                valor1 = dadosDespesas
                    .filter(d =>
                        d.empresa === empresa1 &&
                        d.mes === mes &&
                        d.categoria === categoriaComparacao &&
                        d.tipo === 'despesa'
                    )
                    .reduce((acc, curr) => acc + curr.valor, 0);

                valor2 = dadosDespesas
                    .filter(d =>
                        d.empresa === empresa2 &&
                        d.mes === mes &&
                        d.categoria === categoriaComparacao &&
                        d.tipo === 'despesa'
                    )
                    .reduce((acc, curr) => acc + curr.valor, 0);
            }

            return {
                mes,
                [label1]: valor1,
                [label2]: valor2
            };
        });
    }, [tipoComparacao, categoriaComparacao, ano1, ano2, empresa1, empresa2, dadosDespesas]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4 shadow-2xl">
                    <p className="text-white font-bold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <span className="text-text-muted text-sm">{entry.name}:</span>
                            <span style={{ color: entry.color }} className="font-bold">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Calcular totais
    const chave1 = tipoComparacao === 'anos' ? `${ano1}` : empresa1;
    const chave2 = tipoComparacao === 'anos' ? `${ano2}` : empresa2;
    const total1 = dadosComparacao.reduce((acc, curr) => acc + (curr[chave1] || 0), 0);
    const total2 = dadosComparacao.reduce((acc, curr) => acc + (curr[chave2] || 0), 0);
    const variacao = total1 > 0 ? ((total2 - total1) / total1) * 100 : 0;

    if (!categoriaComparacao || dadosComparacao.length === 0) {
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
                        <span className="material-symbols-outlined text-text-muted text-5xl mb-3">tune</span>
                        <p className="text-text-muted">Configure os filtros para visualizar a comparação</p>
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
                    <p className="text-text-muted text-sm mt-1">
                        {tipoComparacao === 'anos'
                            ? `${ano1} vs ${ano2} - ${categoriaComparacao}`
                            : `${empresa1} vs ${empresa2} - ${categoriaComparacao}`
                        }
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">compare_arrows</span>
                </div>
            </div>

            {/* Tipo de Comparação */}
            <div className="mb-6 p-4 bg-background-dark rounded-xl">
                <label className="text-sm text-text-muted mb-3 block font-medium">Tipo de Comparação</label>
                <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value="anos"
                            checked={tipoComparacao === 'anos'}
                            onChange={(e) => setTipoComparacao(e.target.value as 'anos' | 'empresas')}
                            className="w-4 h-4"
                        />
                        <span className="text-white text-sm">Comparar Anos</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value="empresas"
                            checked={tipoComparacao === 'empresas'}
                            onChange={(e) => setTipoComparacao(e.target.value as 'anos' | 'empresas')}
                            className="w-4 h-4"
                        />
                        <span className="text-white text-sm">Comparar Empresas</span>
                    </label>
                </div>

                {/* Selecionar Categoria */}
                <div className="mb-4">
                    <label className="text-sm text-text-muted mb-2 block">Categoria</label>
                    <select
                        value={categoriaComparacao}
                        onChange={(e) => setCategoriaComparacao(e.target.value)}
                        className="w-full rounded-lg bg-surface-dark border border-border-dark text-white p-2 text-sm"
                    >
                        {categoriasDisponiveis.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Seleção de Período */}
                {tipoComparacao === 'anos' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-text-muted mb-2 block">Ano 1</label>
                            <select
                                value={ano1}
                                onChange={(e) => setAno1(parseInt(e.target.value))}
                                className="w-full rounded-lg bg-surface-dark border border-border-dark text-white p-2 text-sm"
                            >
                                {anosDisponiveis.map(ano => (
                                    <option key={ano} value={ano}>{ano}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-text-muted mb-2 block">Ano 2</label>
                            <select
                                value={ano2}
                                onChange={(e) => setAno2(parseInt(e.target.value))}
                                className="w-full rounded-lg bg-surface-dark border border-border-dark text-white p-2 text-sm"
                            >
                                {anosDisponiveis.map(ano => (
                                    <option key={ano} value={ano}>{ano}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-text-muted mb-2 block">Empresa 1</label>
                            <select
                                value={empresa1}
                                onChange={(e) => setEmpresa1(e.target.value)}
                                className="w-full rounded-lg bg-surface-dark border border-border-dark text-white p-2 text-sm"
                            >
                                {empresasDespesas.filter(e => e !== 'Todas').map(emp => (
                                    <option key={emp} value={emp}>{emp}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-text-muted mb-2 block">Empresa 2</label>
                            <select
                                value={empresa2}
                                onChange={(e) => setEmpresa2(e.target.value)}
                                className="w-full rounded-lg bg-surface-dark border border-border-dark text-white p-2 text-sm"
                            >
                                {empresasDespesas.filter(e => e !== 'Todas').map(emp => (
                                    <option key={emp} value={emp}>{emp}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Métricas de Comparação */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">{chave1}</p>
                    <p className="text-blue-400 text-lg font-bold whitespace-nowrap">{formatCurrency(total1)}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">{chave2}</p>
                    <p className="text-purple-400 text-lg font-bold whitespace-nowrap">{formatCurrency(total2)}</p>
                </div>
                <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">Variação</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-lg font-bold whitespace-nowrap ${variacao >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {variacao >= 0 ? '+' : ''}{variacao.toFixed(1)}%
                        </p>
                        <span className={`material-symbols-outlined text-sm ${variacao >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {variacao >= 0 ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosComparacao} margin={{ top: 20, right: 30, left: 70, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e5e7eb'} />
                        <XAxis
                            dataKey="mes"
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                            width={75}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                            type="monotone"
                            dataKey={chave1}
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey={chave2}
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ComparacaoPeriodos;

