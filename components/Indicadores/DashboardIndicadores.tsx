import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
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
    <div className={`bg-background-light dark:bg-background-dark rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{titulo}</p>
        <p className={`text-2xl font-bold ${cor}`}>{valor.toFixed(2)}%</p>
        {benchmark && <p className="text-xs text-gray-500 dark:text-gray-400">Setor: {benchmark.toFixed(2)}%</p>}
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

    const roe_setor = obterComparativoSetor('roe').benchmarkSetor;
    const roa_setor = obterComparativoSetor('roa').benchmarkSetor;
    const margem_setor = obterComparativoSetor('margemLiquida').benchmarkSetor;

    return (
        <div className="p-6 bg-background-light dark:bg-background-dark min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Indicadores Financeiros</h1>
                <p className="text-gray-600 dark:text-gray-400">Análise de saúde financeira com benchmarks do setor</p>
            </div>

            {/* Filtros */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empresa:
                </label>
                <select
                    value={selectedEmpresa || empresas[0] || ''}
                    onChange={(e) => setSelectedEmpresa(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                >
                    {empresas.map(empresa => (
                        <option key={empresa} value={empresa}>{empresa}</option>
                    ))}
                </select>
            </div>

            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <KPIIndicadorCard
                    titulo="ROE (Retorno do Patrimônio)"
                    valor={indicadores.roe}
                    benchmark={roe_setor}
                    unidade="%"
                    cor="text-blue-600"
                    status={getStatus(indicadores.roe, roe_setor)}
                />
                <KPIIndicadorCard
                    titulo="ROA (Retorno do Ativo)"
                    valor={indicadores.roa}
                    benchmark={roa_setor}
                    unidade="%"
                    cor="text-green-600"
                    status={getStatus(indicadores.roa, roa_setor)}
                />
                <KPIIndicadorCard
                    titulo="Margem Líquida"
                    valor={indicadores.margemLiquida}
                    benchmark={margem_setor}
                    unidade="%"
                    cor="text-purple-600"
                    status={getStatus(indicadores.margemLiquida, margem_setor)}
                />
                <KPIIndicadorCard
                    titulo="Liquidez Corrente"
                    valor={indicadores.liquidezCorrente}
                    benchmark={1.5}
                    unidade="x"
                    cor="text-orange-600"
                    status={getStatus(indicadores.liquidezCorrente, 1.5)}
                />
                <KPIIndicadorCard
                    titulo="Endividamento"
                    valor={indicadores.endividamento}
                    benchmark={40}
                    unidade="%"
                    cor={indicadores.endividamento > 60 ? "text-red-600" : "text-green-600"}
                    status={indicadores.endividamento > 60 ? 'ruim' : 'bom'}
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Evolução de Indicadores */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Evolução de Indicadores</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis width={75} />
                            <Tooltip formatter={(value: any) => value.toFixed(2)} />
                            <Legend />
                            <Line type="monotone" dataKey="roe" stroke="#3b82f6" name="ROE %" strokeWidth={2} />
                            <Line type="monotone" dataKey="roa" stroke="#10b981" name="ROA %" strokeWidth={2} />
                            <Line type="monotone" dataKey="margemLiquida" stroke="#a855f7" name="Margem Líquida %" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Radar Chart - Saúde Geral */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Saúde Financeira Geral</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabela Detalhada */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Detalhamento por Período</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Empresa</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">ROE %</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">ROA %</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Margem %</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Liquidez</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Endividamento %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((item, idx) => {
                                const dataPoint = dados.find(d => d.mes === idx + 1);
                                return (
                                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-background-dark/30">
                                        <td className="px-4 py-2">{dataPoint?.empresa}</td>
                                        <td className="px-4 py-2 text-right">{item.roe.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right">{item.roa.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right">{item.margemLiquida.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right">{dataPoint?.liquidezCorrente.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right">{dataPoint?.endividamento.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardIndicadores;
