import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ContaBalancete } from '../../context/BalanceteContext';

interface RankingContasProps {
    dados: ContaBalancete[];
    empresas: string[];
}

interface ContaRanking {
    nome: string;
    valor: number;
    grupo: string;
    subgrupo: string;
    conta: string;
    cor: string;
}

const colorsByGrupo: { [key: string]: string } = {
    'Ativo': '#3b82f6',
    'Passivo': '#ef4444',
    'PL': '#06b6d4',
};

const RankingContas: React.FC<RankingContasProps> = ({ dados, empresas }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [topN, setTopN] = useState<5 | 10 | 15>(10);
    const [filtroGrupo, setFiltroGrupo] = useState<string>('Todos');

    // Dados já vêm filtrados do contexto
    const dadosFiltrados = dados;

    // Calcular largura dinâmica do YAxis baseado no tamanho das legendas
    const calcularLarguraYAxis = (dados: any[]): number => {
        if (!dados || dados.length === 0) return 100;
        const maiorNome = Math.max(...dados.map(d => (d.nome || '').length));
        // Aproximadamente 7-8 pixels por caractere em fontSize 11
        return Math.min(Math.max(maiorNome * 7.5, 80), 250);
    };

    // Aplicar filtro de grupo
    const dadosComFiltro = filtroGrupo === 'Todos'
        ? dadosFiltrados
        : dadosFiltrados.filter(d => d.grupo === filtroGrupo);

    // Criar ranking
    const ranking: ContaRanking[] = dadosComFiltro
        .map(d => ({
            nome: d.nomeContaContabil,
            valor: Math.abs(d.saldo),
            grupo: d.grupo,
            subgrupo: d.subgrupo,
            conta: d.contaContabil,
            cor: colorsByGrupo[d.grupo] || '#6366f1',
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, topN);

    // Calcular total do ranking
    const totalRanking = ranking.reduce((acc, d) => acc + d.valor, 0);
    const totalGeral = dadosComFiltro.reduce((acc, d) => acc + Math.abs(d.saldo), 0);
    const percentualCobertura = (totalRanking / totalGeral) * 100;

    const handleCustomTooltip = (props: any) => {
        if (props.active && props.payload && props.payload.length > 0) {
            const data = props.payload[0].payload;
            return (
                <div className={`p-3 rounded-xl shadow-lg border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {data.nome}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Conta: {data.conta}
                    </p>
                    <p className={`text-xs font-bold text-primary mt-1`}>
                        R$ {(data.valor / 1000000).toFixed(2)}M
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {data.grupo} • {data.subgrupo}
                    </p>
                </div>
            );
        }
        return null;
    };

    const grupos = Array.from(new Set(dadosFiltrados.map(d => d.grupo)));

    return (
        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg p-6`}>
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Ranking de Contas Críticas
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            Top {topN} contas com maior impacto patrimonial
                        </p>
                    </div>
                </div>

                {/* Controles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Top N Contas
                        </label>
                        <div className="flex gap-2">
                            {[5, 10, 15].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setTopN(n as 5 | 10 | 15)}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${topN === n
                                        ? `${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'} border border-primary`
                                        : `${isDark ? 'bg-surface-dark text-gray-400 border-border-dark' : 'bg-gray-50 text-gray-600 border-gray-300'} border`
                                        }`}
                                >
                                    Top {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Filtrar por Grupo
                        </label>
                        <select
                            value={filtroGrupo}
                            onChange={(e) => setFiltroGrupo(e.target.value)}
                            className={`w-full px-3 py-1.5 rounded border text-xs ${isDark
                                ? 'bg-background-dark border-border-dark text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:border-primary`}
                        >
                            <option value="Todos">Todos os Grupos</option>
                            {grupos.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="w-full h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={ranking}
                        margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                        <XAxis type="number" />
                        <YAxis
                            type="category"
                            dataKey="nome"
                            tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                            width={calcularLarguraYAxis(ranking)}
                        />
                        <Tooltip content={handleCustomTooltip} />
                        <Bar dataKey="valor" fill="#8884d8" radius={[0, 8, 8, 0]}>
                            {ranking.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.cor} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Resumo Estatístico */}
            <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-border-dark w-full max-w-lg">
                    <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Top {topN}
                        </p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            R$ {(totalRanking / 1000000).toFixed(2)}M
                        </p>
                    </div>

                    <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Cobertura do Patrimônio
                        </p>
                        <p className={`text-lg font-bold text-primary`}>
                            {percentualCobertura.toFixed(1)}%
                        </p>
                    </div>

                    <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Média por Conta
                        </p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            R$ {(totalRanking / topN / 1000000).toFixed(2)}M
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabela Detalhe */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className={`border-b ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
                            <th className={`px-4 py-2 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Rank
                            </th>
                            <th className={`px-4 py-2 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Conta
                            </th>
                            <th className={`px-4 py-2 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Grupo
                            </th>
                            <th className={`px-4 py-2 text-right font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Valor
                            </th>
                            <th className={`px-4 py-2 text-right font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                % Patrimônio
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((conta, idx) => (
                            <tr
                                key={idx}
                                className={`border-b transition-colors ${isDark
                                    ? 'border-border-dark hover:bg-background-dark'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <td className={`px-4 py-2 font-bold ${isDark ? 'text-primary' : 'text-primary'}`}>
                                    #{idx + 1}
                                </td>
                                <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <div className="font-semibold">{conta.nome}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} font-mono`}>
                                        {conta.conta}
                                    </div>
                                </td>
                                <td className={`px-4 py-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${conta.grupo === 'Ativo'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : conta.grupo === 'Passivo'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-cyan-500/20 text-cyan-400'
                                        }`}>
                                        {conta.grupo}
                                    </span>
                                </td>
                                <td className={`px-4 py-2 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    R$ {(conta.valor / 1000000).toFixed(2)}M
                                </td>
                                <td className={`px-4 py-2 text-right font-semibold text-primary`}>
                                    {((conta.valor / totalGeral) * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Insights */}
            <div className={`mt-4 p-3 rounded-xl text-xs ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">💡 Insight:</span> As Top {topN} contas representam {percentualCobertura.toFixed(1)}% do patrimônio total. Foco em gestão dessas contas críticas potencializa o impacto de decisões financeiras.
                </p>
            </div>
        </div>
    );
};

export default RankingContas;
