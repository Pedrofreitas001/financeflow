import React, { useState } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ContaBalancete } from '../../context/BalanceteContext';

interface MapaPatrimonialProps {
    dados: ContaBalancete[];
    empresas: string[];
}

interface TreemapNode {
    name: string;
    value: number;
    fill: string;
    conta?: string;
    grupo?: string;
    subgrupo?: string;
    percentual?: number;
    [key: string]: any;
}

const colorsByGrupo: { [key: string]: string } = {
    'Ativo': '#3b82f6',
    'Passivo': '#ef4444',
    'PL': '#06b6d4',
};

const MapaPatrimonial: React.FC<MapaPatrimonialProps> = ({ dados, empresas }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [empresaSelecionada, setEmpresaSelecionada] = useState<string>(empresas.length > 0 ? empresas[0] : '');
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Filtrar dados pela empresa
    const dadosFiltrados = empresaSelecionada
        ? dados.filter(d => d.empresa === empresaSelecionada)
        : dados;

    // Calcular total patrimonial
    const totalPatrimonial = dadosFiltrados.reduce((acc, d) => acc + Math.abs(d.saldo), 0);

    // Preparar dados para treemap: agrupar por grupo e depois por subgrupo
    const treemapData: TreemapNode[] = dadosFiltrados
        .map(conta => ({
            name: conta.nomeContaContabil,
            value: Math.abs(conta.saldo),
            fill: colorsByGrupo[conta.grupo] || '#6366f1',
            conta: conta.contaContabil,
            grupo: conta.grupo,
            subgrupo: conta.subgrupo,
            percentual: (Math.abs(conta.saldo) / totalPatrimonial) * 100,
        }))
        .sort((a, b) => {
            // Ordenar por grupo primeiro
            const grupoOrder: { [key: string]: number } = { 'Ativo': 1, 'Passivo': 2, 'PL': 3 };
            const grupoA = grupoOrder[a.grupo!] || 999;
            const grupoB = grupoOrder[b.grupo!] || 999;
            
            if (grupoA !== grupoB) return grupoA - grupoB;
            
            // Depois por valor decrescente
            return (b.value || 0) - (a.value || 0);
        });

    const handleCustomTooltip = (props: any) => {
        if (props.active && props.payload && props.payload.length > 0) {
            const data = props.payload[0].payload;
            return (
                <div className={`p-3 rounded-lg shadow-lg border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {data.name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Conta: {data.conta}
                    </p>
                    <p className={`text-xs font-bold text-primary mt-1`}>
                        R$ {(data.value / 1000000).toFixed(2)}M ({data.percentual?.toFixed(1)}%)
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {data.grupo} • {data.subgrupo}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Mapa Patrimonial
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        Composição visual do patrimônio (área = valor absoluto)
                    </p>
                </div>

                {empresas.length > 1 && (
                    <select
                        value={empresaSelecionada}
                        onChange={(e) => setEmpresaSelecionada(e.target.value)}
                        className={`px-3 py-2 rounded border text-xs ${isDark
                            ? 'bg-background-dark border-border-dark text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:border-primary`}
                    >
                        {empresas.map(emp => (
                            <option key={emp} value={emp}>{emp}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-border-dark">
                {Object.entries(colorsByGrupo).map(([grupo, cor]) => (
                    <div key={grupo} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: cor }}></div>
                        <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {grupo}
                        </span>
                    </div>
                ))}
            </div>

            {/* Treemap */}
            <div className="w-full h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={treemapData}
                        dataKey="value"
                        stroke={isDark ? '#374151' : '#d1d5db'}
                        fill="#8884d8"
                        onMouseEnter={(state: any) => setHoveredNode(state.name)}
                        onMouseLeave={() => setHoveredNode(null)}
                    >
                        <Tooltip content={handleCustomTooltip} />
                    </Treemap>
                </ResponsiveContainer>
            </div>

            {/* Resumo estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border-dark">
                {['Ativo', 'Passivo', 'PL'].map(grupo => {
                    const totalGrupo = dadosFiltrados
                        .filter(d => d.grupo === grupo)
                        .reduce((acc, d) => acc + Math.abs(d.saldo), 0);
                    const percentual = (totalGrupo / totalPatrimonial) * 100;

                    return (
                        <div key={grupo} className="text-center">
                            <div
                                className="w-8 h-8 rounded mx-auto mb-2"
                                style={{ backgroundColor: colorsByGrupo[grupo] }}
                            ></div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{grupo}</p>
                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                R$ {(totalGrupo / 1000000).toFixed(2)}M
                            </p>
                            <p className="text-xs text-primary font-semibold">{percentual.toFixed(1)}%</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MapaPatrimonial;
