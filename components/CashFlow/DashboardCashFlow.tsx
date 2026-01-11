import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useCashFlow } from '../../context/CashFlowContext/CashFlowContext';

interface KPICashFlowCardProps {
    titulo: string;
    valor: number | string;
    icone: string;
    cor: string;
    subtitulo?: string;
}

const KPICashFlowCard: React.FC<KPICashFlowCardProps> = ({ titulo, valor, icone, cor, subtitulo }) => (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{titulo}</p>
                <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
                {subtitulo && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitulo}</p>}
            </div>
            <div className={`text-3xl ${icone}`}>💰</div>
        </div>
    </div>
);

const DashboardCashFlow: React.FC = () => {
    const { dados, saldoAtual, diasCaixa, contasVencidas, fluxo30Dias, empresas } = useCashFlow();
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const empresa = selectedEmpresa || empresas[0];
        const filtered = dados.filter(d => d.empresa === empresa);

        // Agrupar por data de vencimento
        const agrupado = new Map();
        filtered.forEach(item => {
            const key = item.data_vencimento;
            if (!agrupado.has(key)) {
                agrupado.set(key, { data: key, receitas: 0, despesas: 0 });
            }
            const current = agrupado.get(key);
            if (item.tipo === 'Receber') current.receitas += item.valor;
            else current.despesas += item.valor;
        });

        setChartData(Array.from(agrupado.values()));
    }, [selectedEmpresa, dados, empresas]);

    const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;

    return (
        <div className="p-6 bg-background-light dark:bg-background-dark min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Fluxo de Caixa</h1>
                <p className="text-gray-600 dark:text-gray-400">Gerenciamento de entradas e saídas</p>
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
                <KPICashFlowCard
                    titulo="Saldo Atual"
                    valor={formatCurrency(saldoAtual)}
                    icone="💰"
                    cor="text-green-600"
                />
                <KPICashFlowCard
                    titulo="Dias de Caixa"
                    valor={`${diasCaixa} dias`}
                    icone="📅"
                    cor="text-blue-600"
                />
                <KPICashFlowCard
                    titulo="Contas Vencidas"
                    valor={contasVencidas}
                    icone="⏰"
                    cor={contasVencidas > 0 ? "text-red-600" : "text-green-600"}
                />
                <KPICashFlowCard
                    titulo="Fluxo 30 dias"
                    valor={formatCurrency(fluxo30Dias)}
                    icone="📊"
                    cor={fluxo30Dias > 0 ? "text-green-600" : "text-red-600"}
                />
                <KPICashFlowCard
                    titulo="Status"
                    valor={saldoAtual > 0 ? "Positivo ✅" : "Crítico ⚠️"}
                    icone="🎯"
                    cor={saldoAtual > 0 ? "text-green-600" : "text-red-600"}
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Cascata de Fluxo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Fluxo de Caixa - Receitas vs Despesas</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="data" />
                            <YAxis tickFormatter={formatCurrency} width={75} />
                            <Tooltip formatter={(value: any) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="receitas" stackId="a" fill="#10b981" name="Receitas" />
                            <Bar dataKey="despesas" stackId="a" fill="#ef4444" name="Despesas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Evolução do Saldo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Evolução do Saldo</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="data" />
                            <YAxis tickFormatter={formatCurrency} width={75} />
                            <Tooltip formatter={(value: any) => formatCurrency(value)} />
                            <Area type="monotone" dataKey="receitas" fill="#10b981" stroke="#10b981" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabela de Detalhes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Detalhamento de Contas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Data Vencimento</th>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Categoria</th>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Tipo</th>
                                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Valor</th>
                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados
                                .filter(d => !selectedEmpresa || d.empresa === selectedEmpresa)
                                .map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-background-dark/30">
                                        <td className="px-4 py-2">{item.data_vencimento}</td>
                                        <td className="px-4 py-2">{item.categoria}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.tipo === 'Receber' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {item.tipo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.valor)}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'Pago' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    item.status === 'Atrasado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardCashFlow;
