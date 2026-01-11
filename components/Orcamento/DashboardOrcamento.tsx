import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useOrcamento } from '../../context/OrcamentoContext/OrcamentoContext';

interface KPIOrcamentoCardProps {
    titulo: string;
    valor: number;
    percentual?: number;
    unidade?: string;
    cor: string;
    status: 'positivo' | 'neutro' | 'negativo';
}

const KPIOrcamentoCard: React.FC<KPIOrcamentoCardProps> = ({ titulo, valor, percentual, unidade, cor, status }) => (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{titulo}</p>
        <p className={`text-2xl font-bold ${cor}`}>
            {unidade === '%' ? `${valor.toFixed(1)}%` : `R$ ${(valor / 1000).toFixed(1)}k`}
        </p>
        {percentual !== undefined && (
            <p className={`text-xs font-semibold mt-1 ${percentual > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                {percentual > 0 ? '↑' : '↓'} {Math.abs(percentual).toFixed(1)}% vs Orçado
            </p>
        )}
    </div>
);

const DashboardOrcamento: React.FC = () => {
    const { dados, totalOrcado, totalRealizado, varianciaTotal, varianciaPercentual, empresas, categorias, obterDesviosPorCategoria } = useOrcamento();
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [chartData, setChartData] = useState<any[]>([]);
    const [desviosPorCategoria, setDesviosPorCategoria] = useState<any[]>([]);

    useEffect(() => {
        const empresa = selectedEmpresa || empresas[0];
        const filtered = dados.filter(d => d.empresa === empresa);

        // Agrupar por categoria
        const agrupado = new Map();
        filtered.forEach(item => {
            const key = item.categoria;
            if (!agrupado.has(key)) {
                agrupado.set(key, { categoria: key, orcado: 0, realizado: 0 });
            }
            const current = agrupado.get(key);
            current.orcado += item.orcado;
            current.realizado += item.realizado;
        });

        const data = Array.from(agrupado.values()).map(item => ({
            ...item,
            variancia: item.realizado - item.orcado,
            varianciaPercentual: item.orcado > 0 ? ((item.realizado - item.orcado) / item.orcado) * 100 : 0,
        }));

        setChartData(data);
        setDesviosPorCategoria(obterDesviosPorCategoria());
    }, [selectedEmpresa, dados, empresas, obterDesviosPorCategoria]);

    const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;
    const statusVariancia = varianciaPercentual > 5 ? 'negativo' : varianciaPercentual < -5 ? 'positivo' : 'neutro';

    if (dados.length === 0) {
        return (
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark min-h-screen">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="w-24 h-24 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-primary text-5xl">receipt_long</span>
                        </div>
                        <h2 className="text-white text-2xl font-bold mb-4">Nenhum dado carregado</h2>
                        <p className="text-text-muted mb-8">Use o uploader na barra lateral para carregar dados de orçamento</p>

                        {/* Formato Esperado */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6 w-full max-w-2xl">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Formato Esperado: orcamento_template.xlsx
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
                                            <td className="py-2 font-mono text-primary">categoria</td>
                                            <td>texto</td>
                                            <td>Folha, Aluguel, Fornecedores...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">orcado</td>
                                            <td>número (R$)</td>
                                            <td>80000, 120000...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">realizado</td>
                                            <td>número (R$)</td>
                                            <td>82000, 118000...</td>
                                        </tr>
                                        <tr className="border-b border-border-dark/50">
                                            <td className="py-2 font-mono text-primary">responsavel</td>
                                            <td>texto (opcional)</td>
                                            <td>RH, Compras, Admin...</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-primary">observacoes</td>
                                            <td>texto (opcional)</td>
                                            <td>Acima, Abaixo, Normal...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-text-muted">Arquivo: <span className="text-primary font-mono">dados/excel_exemplos/orcamento_template.xlsx</span></p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark min-h-screen">
            <div className="max-w-[1400px] mx-auto pb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Budgeting vs Realizado</h1>
                <p className="text-gray-600 dark:text-gray-400">Análise de desvios orçamentários e controle de gastos</p>
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

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <KPIOrcamentoCard
                    titulo="Total Orçado"
                    valor={totalOrcado}
                    unidade="R$"
                    cor="text-blue-600"
                    status="neutro"
                />
                <KPIOrcamentoCard
                    titulo="Total Realizado"
                    valor={totalRealizado}
                    unidade="R$"
                    cor={totalRealizado > totalOrcado ? "text-red-600" : "text-green-600"}
                    status={totalRealizado > totalOrcado ? "negativo" : "positivo"}
                />
                <KPIOrcamentoCard
                    titulo="Variância Total"
                    valor={varianciaTotal}
                    unidade="R$"
                    cor={varianciaTotal > 0 ? "text-red-600" : "text-green-600"}
                    status={varianciaTotal > 0 ? "negativo" : "positivo"}
                />
                <KPIOrcamentoCard
                    titulo="Variância %"
                    valor={Math.abs(varianciaPercentual)}
                    percentual={varianciaPercentual}
                    unidade="%"
                    cor={varianciaPercentual > 0 ? "text-red-600" : "text-green-600"}
                    status={statusVariancia}
                />
                <KPIOrcamentoCard
                    titulo="Status do Orçamento"
                    valor={Math.abs(varianciaPercentual)}
                    unidade="%"
                    cor={statusVariancia === 'negativo' ? 'text-red-600' : 'text-green-600'}
                    status={statusVariancia}
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Comparativo Orçado vs Realizado */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Orçado vs Realizado por Categoria</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} interval={0} />
                            <YAxis tickFormatter={formatCurrency} width={75} />
                            <Tooltip formatter={(value: any) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="orcado" fill="#3b82f6" name="Orçado" />
                            <Bar dataKey="realizado" fill="#ef4444" name="Realizado" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Variância por Categoria */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Variância por Categoria</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} interval={0} />
                            <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} width={75} />
                            <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                            <Bar
                                dataKey="varianciaPercentual"
                                fill="#a855f7"
                                name="Variância %"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabela de Desvios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Desvios Críticos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Categoria</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Orçado</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Realizado</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Variância</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">% Desvio</th>
                                <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-background-dark/30">
                                    <td className="px-4 py-2">{item.categoria}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(item.orcado)}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(item.realizado)}</td>
                                    <td className={`px-4 py-2 text-right font-semibold ${item.variancia > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(item.variancia)}
                                    </td>
                                    <td className={`px-4 py-2 text-right font-semibold ${item.varianciaPercentual > 5 ? 'text-red-600' : item.varianciaPercentual < -5 ? 'text-green-600' : 'text-gray-600'}`}>
                                        {item.varianciaPercentual.toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.varianciaPercentual > 5 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            item.varianciaPercentual < -5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                            {item.varianciaPercentual > 5 ? 'Crítico' : item.varianciaPercentual < -5 ? 'Ótimo' : 'OK'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabela de Detalhes Completos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Detalhamento Completo</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Empresa</th>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Categoria</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Orçado</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Realizado</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Responsável</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-background-dark/30">
                                    <td className="px-4 py-2">{item.empresa}</td>
                                    <td className="px-4 py-2">{item.categoria}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(item.orcado)}</td>
                                    <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.realizado)}</td>
                                    <td className="px-4 py-2">{item.responsavel || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default DashboardOrcamento;
