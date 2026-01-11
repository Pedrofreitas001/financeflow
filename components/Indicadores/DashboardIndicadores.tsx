import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useIndicadores } from '../../context/IndicadoresContext/IndicadoresContext';

interface KPIIndicadorCardProps {
    titulo: string;
    valor: number;
    benchmark?: number;
    unidade: string;
    cor: string;
    status: 'bom' | 'regular' | 'ruim';
}

const KPIIndicadorCard: React.FC<KPIIndicadorCardProps> = ({ titulo, valor, benchmark, unidade, cor, status }) => (
    <div className={`bg-surface-dark rounded-lg p-4 border border-border-dark shadow-sm`}>
        <p className="text-gray-400 text-sm">{titulo}</p>
        <p className={`text-2xl font-bold ${cor}`}>{valor.toFixed(2)}%</p>
        {benchmark && <p className="text-xs text-gray-500">Setor: {benchmark.toFixed(2)}%</p>}
        <div className={`mt-2 h-1 w-full rounded ${status === 'bom' ? 'bg-green-500' : status === 'regular' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
    </div>
);

const DashboardIndicadores: React.FC = () => {
    const { dados, indicadores, empresas, obterComparativoSetor } = useIndicadores();
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [chartData, setChartData] = useState<any[]>([]);
    const [radarData, setRadarData] = useState<any[]>([]);

    useEffect(() => {
        const empresa = selectedEmpresa || empresas[0];
        const filtered = dados.filter(d => d.empresa === empresa);

        // Dados para gráfico de linha
        setChartData(filtered.map(d => ({
            mes: `Mês ${d.mes}`,
            roe: parseFloat(d.roe.toFixed(2)),
            roa: parseFloat(d.roa.toFixed(2)),
            margemLiquida: parseFloat(d.margemLiquida.toFixed(2)),
        })));

        // Dados para radar chart (último mês)
        if (filtered.length > 0) {
            const ultimo = filtered[filtered.length - 1];
            setRadarData([
                { name: 'ROE', value: Math.min(Math.abs(ultimo.roe), 100) },
                { name: 'ROA', value: Math.min(Math.abs(ultimo.roa), 100) },
                { name: 'Margem Líquida', value: Math.min(Math.abs(ultimo.margemLiquida), 100) },
                { name: 'Liquidez', value: Math.min(ultimo.liquidezCorrente * 20, 100) },
                { name: 'Alavancagem', value: Math.min(Math.abs(100 - ultimo.endividamento), 100) },
            ]);
        }
    }, [selectedEmpresa, dados, empresas]);

    const getStatus = (valor: number, benchmark: number) => {
        if (valor > benchmark * 1.1) return 'bom';
        if (valor > benchmark * 0.9) return 'regular';
        return 'ruim';
    };

    if (dados.length === 0) {
        return (
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark min-h-screen">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="w-24 h-24 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-primary text-5xl">analytics</span>
                        </div>
                        <h2 className="text-white text-2xl font-bold mb-4">Nenhum dado carregado</h2>
                        <p className="text-text-muted mb-8">Use o uploader na barra lateral para carregar dados de indicadores</p>

                        {/* Formato Esperado */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6 w-full max-w-2xl">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Formato Esperado: indicadores_template.xlsx
                            </h3>
                            <div className="bg-background-dark rounded-lg p-4 mb-4 overflow-x-auto">
                                <table className="text-xs w-full">
                                    <thead>
                                        <tr className="text-text-muted border-b border-border-dark">
                                            <th className="text-left py-2">Coluna</th>
                                            <th className="text-left py-2">Tipo</th>
                                            <th className="text-left py-2">Exemplo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">mes</td>
                                            <td>número</td>
                                            <td>1, 2, 3...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">empresa</td>
                                            <td>texto</td>
                                            <td>Alpha, Beta, Gamma...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">roe</td>
                                            <td>número (%)</td>
                                            <td>15.3, 18.2...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">roa</td>
                                            <td>número (%)</td>
                                            <td>8.2, 9.1...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">margemLiquida</td>
                                            <td>número (%)</td>
                                            <td>12.5, 14.2...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">liquidezCorrente</td>
                                            <td>número (x)</td>
                                            <td>1.8, 1.5...</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-primary">endividamento</td>
                                            <td>número (%)</td>
                                            <td>35.0, 40.5...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-text-muted">Arquivo: <span className="text-primary font-mono">dados/excel_exemplos/indicadores_template.xlsx</span></p>
                        </div>

                        {/* Botões Google Sheets */}
                        <div className="mt-6 flex gap-3">
                            <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                <span className="material-symbols-outlined text-base">open_in_new</span>
                                Visualizar Modelo
                            </a>
                            <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                <span className="material-symbols-outlined text-base">download</span>
                                Baixar Arquivo
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const roe_setor_calc = obterComparativoSetor('roe').benchmarkSetor;
    const roa_setor_calc = obterComparativoSetor('roa').benchmarkSetor;
    const margem_setor_calc = obterComparativoSetor('margemLiquida').benchmarkSetor;

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark min-h-screen">
            <div className="max-w-[1400px] mx-auto pb-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100">Indicadores Financeiros</h1>
                    <p className="text-gray-400 text-sm mt-2">Análise de saúde financeira com benchmarks do setor</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <KPIIndicadorCard
                        titulo="ROE"
                        valor={indicadores.roe}
                        benchmark={roe_setor_calc}
                        unidade="%"
                        cor="text-blue-400"
                        status={getStatus(indicadores.roe, roe_setor_calc)}
                    />
                    <KPIIndicadorCard
                        titulo="ROA"
                        valor={indicadores.roa}
                        benchmark={roa_setor_calc}
                        unidade="%"
                        cor="text-green-400"
                        status={getStatus(indicadores.roa, roa_setor_calc)}
                    />
                    <KPIIndicadorCard
                        titulo="Margem Líquida"
                        valor={indicadores.margemLiquida}
                        benchmark={margem_setor_calc}
                        unidade="%"
                        cor="text-purple-400"
                        status={getStatus(indicadores.margemLiquida, margem_setor_calc)}
                    />
                    <KPIIndicadorCard
                        titulo="Liquidez"
                        valor={indicadores.liquidezCorrente}
                        benchmark={1.5}
                        unidade="x"
                        cor="text-orange-400"
                        status={getStatus(indicadores.liquidezCorrente, 1.5)}
                    />
                    <KPIIndicadorCard
                        titulo="Endividamento"
                        valor={indicadores.endividamento}
                        benchmark={40}
                        unidade="%"
                        cor={indicadores.endividamento > 60 ? "text-red-400" : "text-green-400"}
                        status={indicadores.endividamento > 60 ? 'ruim' : 'bom'}
                    />
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className="text-base font-bold text-white mb-4">Evolução de Indicadores</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData} margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                <YAxis width={75} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => value.toFixed(2)} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                <Legend />
                                <Line type="monotone" dataKey="roe" stroke="#3b82f6" name="ROE %" strokeWidth={2} isAnimationActive={false} />
                                <Line type="monotone" dataKey="roa" stroke="#10b981" name="ROA %" strokeWidth={2} isAnimationActive={false} />
                                <Line type="monotone" dataKey="margemLiquida" stroke="#a855f7" name="Margem %" strokeWidth={2} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className="text-base font-bold text-white mb-4">Saúde Geral</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#444" />
                                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabela */}
                <div className="bg-surface-dark rounded-xl p-6 border border-border-dark overflow-hidden">
                    <h2 className="text-base font-bold text-white mb-4">Detalhamento</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-background-dark border-b border-border-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Empresa</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">ROE %</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">ROA %</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Margem %</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Liquidez</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Endividamento %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dados.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border-dark hover:bg-background-dark/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-300">{item.empresa}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{item.roe.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{item.roa.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{item.margemLiquida.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{item.liquidezCorrente.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{item.endividamento.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Espaço para exportação PDF */}
                <div className="pb-12"></div>
            </div>
        </main>
    );
};

export default DashboardIndicadores;
