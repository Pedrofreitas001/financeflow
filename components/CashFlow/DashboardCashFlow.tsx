import React, { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCashFlow } from '../../context/CashFlowContext/CashFlowContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardCashFlow: React.FC = () => {
    const { dados, saldoAtual, diasCaixa, contasVencidas, fluxo30Dias, empresas } = useCashFlow();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const empresa = selectedEmpresa || empresas[0];
        const filtered = dados.filter(d => d.empresa === empresa);

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

    if (dados.length === 0) {
        return (
            <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-white'}`}>
                <div className={`flex-1 overflow-y-auto custom-scrollbar flex items-center justify-center relative`} style={{
                    backgroundColor: '#0f1d32',
                    backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59, 130, 246, 0.45) 0%, rgba(37, 99, 235, 0.25) 40%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.35) 0%, transparent 50%), radial-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 100% 100%, 24px 24px'
                }}>
                    <div className="max-w-2xl w-full mx-auto px-8">
                        <div className="flex flex-col items-center justify-center text-center mb-8">
                            <h2 data-cta-header style={{ color: '#ffffff !important', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                                Nenhum dado carregado
                            </h2>
                            <p data-cta-text style={{ color: '#d1d5db !important' }}>
                                Importe um arquivo Excel com dados de fluxo de caixa para visualizar
                            </p>
                        </div>

                        {/* Informações do Formato */}
                        <div className="rounded-2xl border border-gray-300 shadow-lg p-6 bg-white">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Formato Esperado: CashFlow_Exemplo.xlsx
                            </h3>
                            <div className="rounded-lg p-4 mb-4 overflow-x-auto bg-gray-50">
                                <table className="text-xs w-full">
                                    <thead>
                                        <tr className="text-gray-600 border-b border-gray-300">
                                            <th className="text-left py-2">Coluna</th>
                                            <th className="text-left py-2">Tipo</th>
                                            <th className="text-left py-2">Exemplo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 font-mono text-primary">id</td>
                                            <td>texto</td>
                                            <td>cf1, cf2, cf3...</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 font-mono text-primary">mes</td>
                                            <td>número</td>
                                            <td>1, 2, 3...</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 font-mono text-primary">empresa</td>
                                            <td>texto</td>
                                            <td>Alpha, Beta, Gamma...</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 font-mono text-primary">tipo</td>
                                            <td>Receber ou Pagar</td>
                                            <td>Receber, Pagar</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 font-mono text-primary">categoria</td>
                                            <td>texto</td>
                                            <td>Vendas, Folha, Aluguel...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">data_vencimento</td>
                                            <td>data (DD/MM/YYYY)</td>
                                            <td>15/01/2025</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">valor</td>
                                            <td>número</td>
                                            <td>50000, 120000...</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-primary">status</td>
                                            <td>Aberto, Parcial, Pago, Atrasado</td>
                                            <td>Pago, Aberto</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">CashFlow_Exemplo.xlsx</span></p>

                            {/* Botão Download */}
                            <a data-cta-button href="https://docs.google.com/spreadsheets/d/1AZEKUMdnSJXZPX6_nHbwrrcvfNl7bX7V95X3Yf9Kq9g/export?format=xlsx" download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                                <span className="material-symbols-outlined text-base">download</span>
                                Baixar Arquivo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark min-h-screen">
            <div className="max-w-[1400px] mx-auto pb-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100">Fluxo de Caixa</h1>
                    <p className="text-gray-400 text-sm mt-2">Gerenciamento de entradas e saídas</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
                        <p className="text-xs font-bold text-text-muted uppercase mb-2">Saldo Atual</p>
                        <p className="text-2xl font-bold text-blue-500">{formatCurrency(saldoAtual)}</p>
                    </div>
                    <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
                        <p className="text-xs font-bold text-text-muted uppercase mb-2">Dias de Caixa</p>
                        <p className="text-2xl font-bold text-blue-500">{diasCaixa} dias</p>
                    </div>
                    <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
                        <p className="text-xs font-bold text-text-muted uppercase mb-2">Contas Vencidas</p>
                        <p className={`text-2xl font-bold ${contasVencidas > 0 ? 'text-red-500' : 'text-blue-500'}`}>{contasVencidas}</p>
                    </div>
                    <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
                        <p className="text-xs font-bold text-text-muted uppercase mb-2">Fluxo 30 dias</p>
                        <p className={`text-2xl font-bold ${fluxo30Dias > 0 ? 'text-blue-500' : 'text-red-500'}`}>{formatCurrency(fluxo30Dias)}</p>
                    </div>
                    <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
                        <p className="text-xs font-bold text-text-muted uppercase mb-2">Status</p>
                        <p className={`text-lg font-bold ${saldoAtual > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                            {saldoAtual > 0 ? 'Positivo ✅' : 'Crítico ⚠️'}
                        </p>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className="text-base font-bold text-white mb-4">Receitas vs Despesas</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={formatCurrency} width={75} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="receitas" stackId="a" fill="#10b981" name="Receitas" isAnimationActive={false} />
                                <Bar dataKey="despesas" stackId="a" fill="#ef4444" name="Despesas" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className="text-base font-bold text-white mb-4">Evolução do Saldo</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={formatCurrency} width={75} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="receitas" fill="#10b981" stroke="#10b981" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabela */}
                <div className="bg-surface-dark rounded-xl p-6 border border-border-dark overflow-hidden">
                    <h2 className="text-base font-bold text-white mb-4">Detalhamento de Contas</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-background-dark border-b border-border-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Data Vencimento</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Categoria</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-text-muted uppercase">Valor</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dados
                                    .filter(d => !selectedEmpresa || d.empresa === selectedEmpresa)
                                    .map((item, idx) => (
                                        <tr key={idx} className="border-b border-border-dark hover:bg-background-dark/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-300">{item.data_vencimento}</td>
                                            <td className="px-4 py-3 text-gray-300">{item.categoria}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.tipo === 'Receber' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {item.tipo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-300">{formatCurrency(item.valor)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Pago' ? 'bg-blue-500/20 text-blue-400' :
                                                    item.status === 'Atrasado' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
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

                {/* Espaço para exportação PDF */}
                <div className="pb-12"></div>
            </div>
        </main>
    );
};

export default DashboardCashFlow;
