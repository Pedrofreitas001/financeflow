import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useOrcamento } from '../../context/OrcamentoContext/OrcamentoContext';

interface KPIOrcamentoCardProps {
    titulo: string;
    valor: number;
    percentual?: number;
    unidade?: string;
    cor: string;
    status: 'positivo' | 'neutro' | 'negativo';
}

const KPIOrcamentoCard: React.FC<KPIOrcamentoCardProps> = ({ titulo, valor, percentual, unidade, cor, status }) => {
    // Garantir que valor é um número válido
    const valorValido = isNaN(valor) ? 0 : valor;
    const percentualValido = percentual !== undefined && isNaN(percentual) ? 0 : percentual;

    return (
        <div className={`bg-surface-dark rounded-lg p-4 border border-border-dark shadow-sm`}>
            <p className="text-gray-400 text-sm">{titulo}</p>
            <p className={`text-2xl font-bold ${cor}`}>
                {unidade === '%' ? `${valorValido.toFixed(1)}%` : `R$ ${(valorValido / 1000).toFixed(1)}k`}
            </p>
            {percentualValido !== undefined && (
                <p className={`text-xs font-semibold mt-1 ${percentualValido > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                    {percentualValido > 0 ? '↑' : '↓'} {Math.abs(percentualValido).toFixed(1)}% vs Orçado
                </p>
            )}
        </div>
    );
};

const DashboardOrcamento: React.FC = () => {
    const { dados, totalOrcado, totalRealizado, varianciaTotal, varianciaPercentual, empresas, obterDesviosPorCategoria } = useOrcamento();
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

    const formatCurrency = (value: number) => {
        const validValue = isNaN(value) ? 0 : value;
        return `R$ ${(validValue / 1000).toFixed(1)}k`;
    };
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100">Budgeting vs Realizado</h1>
                    <p className="text-gray-400 text-sm mt-2">Análise de desvios orçamentários e controle de gastos</p>
                </div>

                {/* Links para Google Sheets */}
                <div className="mb-6 flex gap-3">
                    <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                        Visualizar Modelo
                    </a>
                    <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                        <span className="material-symbols-outlined text-base">download</span>
                        Baixar Arquivo
                    </a>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <KPIOrcamentoCard
                        titulo="Total Orçado"
                        valor={totalOrcado}
                        unidade="R$"
                        cor="text-blue-400"
                        status="neutro"
                    />
                    <KPIOrcamentoCard
                        titulo="Total Realizado"
                        valor={totalRealizado}
                        unidade="R$"
                        cor={totalRealizado > totalOrcado ? "text-red-400" : "text-green-400"}
                        status={totalRealizado > totalOrcado ? "negativo" : "positivo"}
                    />
                    <KPIOrcamentoCard
                        titulo="Variância Total"
                        valor={varianciaTotal}
                        unidade="R$"
                        cor={varianciaTotal > 0 ? "text-red-400" : "text-green-400"}
                        status={varianciaTotal > 0 ? "negativo" : "positivo"}
                    />
                    <KPIOrcamentoCard
                        titulo="Variância %"
                        valor={Math.abs(varianciaPercentual)}
                        percentual={varianciaPercentual}
                        unidade="%"
                        cor={varianciaPercentual > 0 ? "text-red-400" : "text-green-400"}
                        status={statusVariancia}
                    />
                    <KPIOrcamentoCard
                        titulo="Status"
                        valor={Math.abs(varianciaPercentual)}
                        unidade="%"
                        cor={Math.abs(varianciaPercentual) > 5 ? "text-red-400" : "text-green-400"}
                        status={statusVariancia}
                    />
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className="text-base font-bold text-white mb-4">Orçado vs Realizado</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={formatCurrency} width={75} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="orcado" fill="#3b82f6" name="Orçado" isAnimationActive={false} />
                                <Bar dataKey="realizado" fill="#10b981" name="Realizado" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className="text-base font-bold text-white mb-4">Variância por Categoria</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={formatCurrency} width={75} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="variancia" fill="#8b5cf6" name="Variância" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabela - Desvios Críticos */}
                <div className="bg-surface-dark rounded-xl p-6 border border-border-dark overflow-hidden mb-6">
                    <h2 className="text-base font-bold text-white mb-4">Desvios Críticos (variância &gt; 5%)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-background-dark border-b border-border-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Categoria</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Orçado</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Realizado</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Variância</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">%</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {desviosPorCategoria
                                    .filter(d => Math.abs(d.percentual) > 5)
                                    .map((item, idx) => (
                                        <tr key={idx} className="border-b border-border-dark hover:bg-background-dark/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-300">{item.categoria}</td>
                                            <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(item.orcado)}</td>
                                            <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(item.realizado)}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.variancia)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`font-bold ${item.variancia > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {item.percentual > 0 ? '+' : ''}{item.percentual.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${Math.abs(item.percentual) > 10 ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {Math.abs(item.percentual) > 10 ? 'Crítico' : 'Atenção'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabela - Detalhamento Completo */}
                <div className="bg-surface-dark rounded-xl p-6 border border-border-dark overflow-hidden">
                    <h2 className="text-base font-bold text-white mb-4">Detalhamento Completo</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-background-dark border-b border-border-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Categoria</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Orçado</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Realizado</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Variância</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Percentual</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Responsável</th>
                                </tr>
                            </thead>
                            <tbody>
                                {desviosPorCategoria.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border-dark hover:bg-background-dark/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-300">{item.categoria}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(item.orcado)}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(item.realizado)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-300">{formatCurrency(item.variancia)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`font-bold ${item.variancia > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {item.percentual > 0 ? '+' : ''}{item.percentual.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">-</td>
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

export default DashboardOrcamento;
