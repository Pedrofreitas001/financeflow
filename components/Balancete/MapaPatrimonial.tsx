import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ContaBalancete } from '../../context/BalanceteContext';

interface MapaPatrimonialProps {
    dados: ContaBalancete[];
    empresas: string[];
    totais: {
        ativo: number;
        passivo: number;
        pl: number;
    };
}

interface WaterfallStep {
    name: string;
    value: number;
    fill: string;
    type: 'initial' | 'reduction' | 'final';
    absoluteValue: number;
}

const MapaPatrimonial: React.FC<MapaPatrimonialProps> = ({ dados, empresas, totais }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Dados já vêm filtrados do contexto
    const dadosFiltrados = dados;

    // Usar totais já calculados no contexto
    const ativoTotal = totais.ativo;
    const passivoTotal = totais.passivo;
    const plTotal = totais.pl;

    // Dataset para o Waterfall
    const waterfallData: WaterfallStep[] = [
        {
            name: 'Ativo Total',
            value: ativoTotal,
            fill: '#3b82f6',
            type: 'initial',
            absoluteValue: ativoTotal,
        },
        {
            name: 'Passivo Total',
            value: -passivoTotal,
            fill: '#ef4444',
            type: 'reduction',
            absoluteValue: passivoTotal,
        },
        {
            name: 'Patrimônio Líquido',
            value: plTotal,
            fill: '#06b6d4',
            type: 'final',
            absoluteValue: plTotal,
        },
    ];

    const handleCustomTooltip = (props: any) => {
        if (props.active && props.payload && props.payload.length > 0) {
            const data = props.payload[0].payload;
            const percentualAtivo = (data.absoluteValue / ativoTotal) * 100;

            return (
                <div className={`p-3 rounded-lg shadow-lg border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'}`}>
                    <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {data.name}
                    </p>
                    <p className={`text-xs font-bold text-primary mt-1`}>
                        R$ {(data.absoluteValue / 1000000).toFixed(2)}M
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {percentualAtivo.toFixed(1)}% do Ativo Total
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatarValor = (valor: number) => {
        return `R$ ${Math.abs(valor / 1000000).toFixed(2)}M`;
    };

    return (
        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Formação do Patrimônio
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        Ativo Total − Passivo Total = Patrimônio Líquido
                    </p>
                </div>
            </div>

            {/* Gráfico Waterfall */}
            <div className="w-full h-[380px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={waterfallData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                        <Tooltip content={handleCustomTooltip} />
                        <Bar
                            dataKey="value"
                            fill="#8884d8"
                            radius={[8, 8, 0, 0]}
                        >
                            {waterfallData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                        <ReferenceLine y={0} stroke={isDark ? '#6b7280' : '#d1d5db'} strokeWidth={2} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Narrativa Visual */}
            <div className="space-y-4">
                {waterfallData.map((step, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'} border ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: step.fill }}
                                ></div>
                                <div>
                                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {step.name}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
                                        {step.type === 'initial' && 'Ponto de partida: Soma de todos os ativos'}
                                        {step.type === 'reduction' && 'Dedução: Obrigações da empresa'}
                                        {step.type === 'final' && 'Resultado: Capital próprio da empresa'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatarValor(step.absoluteValue)}
                                </p>
                                <p className="text-xs text-primary font-semibold">
                                    {((step.absoluteValue / ativoTotal) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Validação de Balancete */}
            <div className={`mt-6 p-4 rounded-lg text-xs ${isDark ? 'bg-background-dark' : 'bg-gray-50'} border ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">📊 Validação:</span> Ativo ({formatarValor(ativoTotal)}) = Passivo ({formatarValor(passivoTotal)}) + PL ({formatarValor(plTotal)})
                    <br />
                    <span className={`text-xs mt-2 block ${Math.abs(ativoTotal - (passivoTotal + plTotal)) < 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {Math.abs(ativoTotal - (passivoTotal + plTotal)) < 1 ? '✓ Balancete validado' : '⚠ Diferença detectada'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default MapaPatrimonial;
