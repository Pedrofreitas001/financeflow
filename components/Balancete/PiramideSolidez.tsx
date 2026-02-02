import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface PiramideSolidezProps {
    empresas: string[];
    totais: {
        ativo: number;
        passivo: number;
        pl: number;
        passivoCirculante: number;
        passivoNaoCirculante: number;
    };
}

interface CamadaPiramide {
    nome: string;
    valor: number;
    percentualAtivo: number;
    cor: string;
}

const PiramideSolidez: React.FC<PiramideSolidezProps> = ({ empresas, totais }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [visualizacao, setVisualizacao] = useState<'piramide' | 'barras'>('piramide');

    const formatYAxis = (value: number) => {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
            return `R$${(value / 1000000).toFixed(0)}M`;
        } else if (absValue >= 1000) {
            return `R$${(value / 1000).toFixed(0)}k`;
        }
        return `R$${value.toFixed(0)}`;
    };

    // Calcular largura dinâmica do YAxis baseado no tamanho das legendas
    const calcularLarguraYAxis = (dados: any[]): number => {
        if (!dados || dados.length === 0) return 80;
        const maiorNome = Math.max(...dados.map(d => (d.nome || '').length));
        // Aproximadamente 7-8 pixels por caractere em fontSize 12
        return Math.min(Math.max(maiorNome * 7.5, 60), 200);
    };

    // Calcular camadas da pirâmide
    const ativoTotal = totais.ativo || 1; // Evitar divisão por zero
    const totalFinanciamento = totais.passivo + totais.pl;

    const camadas: CamadaPiramide[] = [
        {
            nome: 'Patrimônio Líquido',
            valor: totais.pl,
            percentualAtivo: (totais.pl / ativoTotal) * 100,
            cor: '#06b6d4', // cyan
        },
        {
            nome: 'Passivo Não Circulante',
            valor: totais.passivoNaoCirculante,
            percentualAtivo: (totais.passivoNaoCirculante / ativoTotal) * 100,
            cor: '#8b5cf6', // purple
        },
        {
            nome: 'Passivo Circulante',
            valor: totais.passivoCirculante,
            percentualAtivo: (totais.passivoCirculante / ativoTotal) * 100,
            cor: '#ef4444', // red
        },
    ];

    // Dados para visualização em barras (invertida para simular pirâmide visual)
    const dadosBarras = [...camadas].reverse().map((c, idx) => ({
        ...c,
        ordem: idx + 1,
    }));

    // Cálculo de solidez
    const solidezPL = (totais.pl / ativoTotal) * 100;
    const solidezPassivoLP = (totais.passivoNaoCirculante / ativoTotal) * 100;
    const solidezPassivoCP = (totais.passivoCirculante / ativoTotal) * 100;

    const statusSolidez = solidezPL > 50 ? 'forte' : solidezPL > 30 ? 'moderada' : 'fraca';
    const statusSolidezTexto = {
        forte: { texto: 'Estrutura Forte', cor: 'text-blue-400', bg: 'bg-blue-500/20' },
        moderada: { texto: 'Estrutura Moderada', cor: 'text-yellow-400', bg: 'bg-yellow-500/20' },
        fraca: { texto: 'Estrutura Fraca', cor: 'text-red-400', bg: 'bg-red-500/20' },
    };

    const handleCustomTooltip = (props: any) => {
        if (props.active && props.payload && props.payload.length > 0) {
            const data = props.payload[0].payload;
            return (
                <div className={`p-3 rounded-xl shadow-lg border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {data.nome}
                    </p>
                    <p className={`text-xs font-bold text-primary mt-1`}>
                        R$ {(data.valor / 1000000).toFixed(2)}M
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {data.percentualAtivo.toFixed(1)}% do Ativo Total
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
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Pirâmide de Solidez Financeira
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        Estrutura de financiamento e composição do passivo + PL
                    </p>
                </div>

                <div className={`px-3 py-1.5 rounded-full font-semibold text-xs ${statusSolidezTexto[statusSolidez].bg} ${statusSolidezTexto[statusSolidez].cor}`}>
                    {statusSolidezTexto[statusSolidez].texto}
                </div>
            </div>

            {/* Abas de Visualização */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setVisualizacao('piramide')}
                    className={`px-4 py-2 rounded text-xs font-semibold transition-all ${visualizacao === 'piramide'
                        ? `${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'} border border-primary`
                        : `${isDark ? 'bg-surface-dark text-gray-400 border-border-dark' : 'bg-gray-50 text-gray-600 border-gray-300'} border`
                        }`}
                >
                    Visualização Piramidal
                </button>
                <button
                    onClick={() => setVisualizacao('barras')}
                    className={`px-4 py-2 rounded text-xs font-semibold transition-all ${visualizacao === 'barras'
                        ? `${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'} border border-primary`
                        : `${isDark ? 'bg-surface-dark text-gray-400 border-border-dark' : 'bg-gray-50 text-gray-600 border-gray-300'} border`
                        }`}
                >
                    Visualização em Barras
                </button>
            </div>

            {visualizacao === 'piramide' ? (
                // Visualização em Pirâmide (CSS)
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-full max-w-xs space-y-0">
                        {/* Topo: PL */}
                        <div
                            className="mx-auto rounded-t-3xl text-white font-bold transition-all hover:shadow-lg cursor-pointer"
                            style={{
                                backgroundColor: camadas[0].cor,
                                width: '45%',
                                padding: '16px 12px',
                                textAlign: 'center',
                            }}
                        >
                            <div className="text-xs font-bold text-white">Patrimônio Líquido</div>
                            <div className="text-lg font-black mt-1 text-white">
                                {camadas[0].percentualAtivo.toFixed(0)}%
                            </div>
                            <div className="text-xs text-white/80 mt-0.5">R$ {(camadas[0].valor / 1000000).toFixed(2)}M</div>
                        </div>

                        {/* Meio: Passivo Não Circulante */}
                        <div
                            className="mx-auto text-white font-bold transition-all hover:shadow-lg cursor-pointer"
                            style={{
                                backgroundColor: camadas[1].cor,
                                width: '65%',
                                padding: '16px 12px',
                                textAlign: 'center',
                            }}
                        >
                            <div className="text-xs font-bold text-white">Passivo Não Circulante</div>
                            <div className="text-lg font-black mt-1 text-white">
                                {camadas[1].percentualAtivo.toFixed(0)}%
                            </div>
                            <div className="text-xs text-white/80 mt-0.5">R$ {(camadas[1].valor / 1000000).toFixed(2)}M</div>
                        </div>

                        {/* Base: Passivo Circulante */}
                        <div
                            className="mx-auto rounded-b-3xl text-white font-bold transition-all hover:shadow-lg cursor-pointer"
                            style={{
                                backgroundColor: camadas[2].cor,
                                width: '100%',
                                padding: '16px 12px',
                                textAlign: 'center',
                            }}
                        >
                            <div className="text-xs font-bold text-white">Passivo Circulante</div>
                            <div className="text-lg font-black mt-1 text-white">
                                {camadas[2].percentualAtivo.toFixed(0)}%
                            </div>
                            <div className="text-xs text-white/80 mt-0.5">R$ {(camadas[2].valor / 1000000).toFixed(2)}M</div>
                        </div>
                    </div>

                    {/* Legenda interpretativa */}
                    <div className={`mt-12 p-4 rounded-xl text-xs ${isDark ? 'bg-background-dark' : 'bg-gray-50'} w-full`}>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-bold">Interpretação:</span> Uma pirâmide mais larga na base e estreita no topo indica maior endividamento. Uma estrutura mais balanceada reflete menos risco financeiro.
                        </p>
                    </div>
                </div>
            ) : (
                // Visualização em Barras Horizontais
                <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={dadosBarras}
                            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3b5445' : '#e5e7eb'} />
                            <XAxis type="number" tickFormatter={formatYAxis} />
                            <YAxis
                                type="category"
                                dataKey="nome"
                                tick={{ fontSize: 12, fill: isDark ? '#9db9a8' : '#6b7280' }}
                                width={calcularLarguraYAxis(dadosBarras)}
                            />
                            <Tooltip content={handleCustomTooltip} />
                            <Bar dataKey="percentualAtivo" fill="#8884d8" radius={[0, 8, 8, 0]}>
                                {dadosBarras.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.cor} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Resumo de Solidez */}
            <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-border-dark w-full max-w-lg">
                    <div className="text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: '#06b6d4' }}></div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Capital Próprio</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {solidezPL.toFixed(1)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: '#8b5cf6' }}></div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Financiamento LP</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {solidezPassivoLP.toFixed(1)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: '#ef4444' }}></div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Obrigações CP</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {solidezPassivoCP.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PiramideSolidez;
