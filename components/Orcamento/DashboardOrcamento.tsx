import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useOrcamento } from '../../context/OrcamentoContext/OrcamentoContext';
import DataUploadModal from '../DataUploadModal';
import InsertDataButton from '../InsertDataButton';
import SaveDataButton from '../SaveDataButton';
import ClearDataButton from '../ClearDataButton';
import UpdateFromSheetsButton from '../UpdateFromSheetsButton';
import DownloadTemplateButton from '../DownloadTemplateButton';
import Toast from '../Toast';
import { DASHBOARD_TEMPLATE_URLS } from '@/utils/dashboardTemplateUrls';
import { importFromExcel } from '@/utils/excelUtils';
import { markDataSource, markUserDataLoaded } from '@/utils/userDataState';

interface KPIOrcamentoCardProps {
    titulo: string;
    valor: number;
    percentual?: number;
    unidade?: string;
    cor: string;
    status: 'positivo' | 'neutro' | 'negativo';
}

const KPIOrcamentoCard: React.FC<KPIOrcamentoCardProps> = ({ titulo, valor, percentual, unidade, cor, status }) => {
    const { theme } = useTheme();
    const isDarkCard = theme === 'dark';

    // Garantir que valor é um número válido
    const valorValido = isNaN(valor) ? 0 : valor;
    const percentualValido = percentual !== undefined && isNaN(percentual) ? 0 : percentual;

    return (
        <div className={`${isDarkCard ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-lg p-4 border shadow-sm`}>
            <p className={`${isDarkCard ? 'text-gray-400' : 'text-gray-900'} text-sm`}>{titulo}</p>
            <p className={`text-2xl font-bold ${isDarkCard ? cor : 'text-gray-900'}`}>
                {unidade === '%' ? `${valorValido.toFixed(1)}%` : `R$ ${(valorValido / 1000).toFixed(1)}k`}
            </p>
            {percentualValido !== undefined && (
                <p className={`text-xs font-semibold mt-1 ${percentualValido > 0 ? 'text-red-400' : 'text-blue-400'}
                    }`}>
                    {percentualValido > 0 ? '↑' : '↓'} {Math.abs(percentualValido).toFixed(1)}% vs Orçado
                </p>
            )}
        </div>
    );
};

const DashboardOrcamento: React.FC = () => {
    const { dados, setDados, empresas } = useOrcamento();

    // Validação dos dados de orçamento
    function validarDadosOrcamento(rows: any[]): any[] {
        if (!Array.isArray(rows)) return [];
        // Logar dados brutos importados
        // eslint-disable-next-line no-console
        console.log('[Orcamento] Dados brutos importados:', rows);
        const validos: any[] = [];
        const descartados: any[] = [];
        rows.forEach((row, idx) => {
            try {
                // Aceitar nomes alternativos das colunas
                const mes = row?.mes ?? row?.Mes ?? row?.MES ?? row?.Mês ?? row?.MÊS;
                const empresa = row?.empresa ?? row?.Empresa ?? row?.EMPRESA ?? row?.Empresa;
                const categoria = row?.categoria ?? row?.Categoria ?? row?.CATEGORIA ?? row?.Categoria;
                const orcadoRaw = row?.orcado ?? row?.Orcado ?? row?.ORCADO ?? row?.Orçado ?? row?.ORÇADO;
                const realizadoRaw = row?.realizado ?? row?.Realizado ?? row?.REALIZADO ?? row?.Realizado;
                const responsavel = row?.responsavel ?? row?.Responsavel ?? row?.RESPONSAVEL ?? row?.Responsável ?? '';
                const observacoes = row?.observacoes ?? row?.Observacoes ?? row?.OBSERVACOES ?? row?.Observações ?? '';
                // Corrigir conversão: remover separador de milhar e garantir decimal
                const parseNumber = (val: any) => {
                    if (typeof val === 'string') {
                        // Se for só número, retorna direto
                        if (/^\d+$/.test(val)) return Number(val);
                        // Se for decimal com vírgula (18666,00)
                        if (/^\d+,\d+$/.test(val)) return Number(val.replace(/,/g, '.'));
                        // Se for decimal com ponto (18666.00)
                        if (/^\d+\.\d+$/.test(val)) return Number(val);
                        // Fallback: remove tudo exceto números, ponto e menos
                        let num = val.replace(/[^0-9\-.]/g, '');
                        return Number(num);
                    }
                    return Number(val);
                };
                const orcado = parseNumber(orcadoRaw);
                const realizado = parseNumber(realizadoRaw);
                // Debug: log valores convertidos
                // eslint-disable-next-line no-console
                console.log('[Orcamento] Convertido:', { idx, mes, empresa, categoria, orcadoRaw, realizadoRaw, orcado, realizado });
                if (mes && empresa && categoria && !isNaN(orcado) && !isNaN(realizado)) {
                    validos.push({
                        mes,
                        empresa,
                        categoria,
                        orcado,
                        realizado,
                        responsavel,
                        observacoes,
                    });
                } else {
                    descartados.push({ idx, row });
                }
            } catch (err) {
                descartados.push({ idx, row, err });
            }
        });
        if (descartados.length > 0) {
            // eslint-disable-next-line no-console
            console.warn('[Orcamento] Dados descartados na validação:', descartados);
        }
        if (validos.length === 0) {
            // eslint-disable-next-line no-console
            console.error('[Orcamento] Nenhum dado válido encontrado. Verifique as colunas e os valores do Excel.');
        }
        return validos;
    }
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [chartData, setChartData] = useState<any[]>([]);
    const [desviosPorCategoria, setDesviosPorCategoria] = useState<any[]>([]);
    const [totalOrcadoFiltrado, setTotalOrcadoFiltrado] = useState(0);
    const [totalRealizadoFiltrado, setTotalRealizadoFiltrado] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    useEffect(() => {
        const empresa = selectedEmpresa || (empresas.length > 0 ? empresas[0] : '');
        const filtered = empresa ? dados.filter(d => d.empresa === empresa) : [];

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

        // Calcular desvios a partir dos dados filtrados
        const desvios = data.map(item => ({
            categoria: item.categoria,
            orcado: item.orcado,
            realizado: item.realizado,
            variancia: item.variancia,
            percentual: item.varianciaPercentual
        }));
        setDesviosPorCategoria(desvios);

        // Calcular totais filtr ados
        const totalOrcado = filtered.reduce((acc, item) => acc + item.orcado, 0);
        const totalRealizado = filtered.reduce((acc, item) => acc + item.realizado, 0);
        setTotalOrcadoFiltrado(totalOrcado);
        setTotalRealizadoFiltrado(totalRealizado);
    }, [selectedEmpresa, dados, empresas]);

    const formatCurrency = (value: number) => {
        const validValue = isNaN(value) ? 0 : value;
        return `R$ ${(validValue / 1000).toFixed(1)}k`;
    };

    const varianciaFiltrадa = totalRealizadoFiltrado - totalOrcadoFiltrado;
    const varianciaPercentualFiltrada = totalOrcadoFiltrado > 0 ? (varianciaFiltrадa / totalOrcadoFiltrado) * 100 : 0;
    const statusVarianciaFiltrada = varianciaPercentualFiltrada > 5 ? 'negativo' : varianciaPercentualFiltrada < -5 ? 'positivo' : 'neutro';

    if (dados.length === 0) {
        return (
            <>
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
                                Importe um arquivo Excel com dados de orçamento para visualizar
                            </p>
                        </div>

                        {/* Informações do Formato */}
                        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg p-6`}>
                            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <span className="material-symbols-outlined text-primary">description</span>
                                Formato Esperado: Orcamento_Exemplo.xlsx
                            </h3>
                            <div className={`${isDark ? 'bg-background-dark' : 'bg-gray-50'} rounded-lg p-4 mb-4 overflow-x-auto`}>
                                <table className="text-xs w-full">
                                    <thead>
                                        <tr className={`${isDark ? 'text-text-muted border-b border-border-dark' : 'text-gray-600 border-b border-gray-300'}`}>
                                            <th className="text-left py-2">Coluna</th>
                                            <th className="text-left py-2">Tipo</th>
                                            <th className="text-left py-2">Exemplo</th>
                                        </tr>
                                    </thead>
                                    <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">mes</td>
                                            <td>número</td>
                                            <td>1, 2, 3...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">empresa</td>
                                            <td>texto</td>
                                            <td>Alpha, Beta, Gamma...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">categoria</td>
                                            <td>texto</td>
                                            <td>Folha, Aluguel, Fornecedores...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">orcado</td>
                                            <td>número (R$)</td>
                                            <td>80000, 120000...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">realizado</td>
                                            <td>número (R$)</td>
                                            <td>82000, 118000...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
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
                            <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">Orcamento_Exemplo.xlsx</span></p>

                            {/* Botão Download */}
                            <a data-cta-button href={DASHBOARD_TEMPLATE_URLS.orcamento} download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                                <span className="material-symbols-outlined text-base">download</span>
                                Baixar Arquivo
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-8 justify-center items-center">
                            <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
                            <SaveDataButton dashboardType="orcamento" data={[]} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos!', type: 'success' })} onError={(e) => setToast({ message: `❌ ${e}`, type: 'error' })} />
                            <UpdateFromSheetsButton dashboardType="orcamento" onDataLoaded={(data) => { setDados(validarDadosOrcamento(data)); setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' }); }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
                            <ClearDataButton onClear={() => setDados([])} compact />
                            <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.orcamento} />
                        </div>
                    </div>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    return (
        <>
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-gray-50'} min-h-screen`}>
            <div className="max-w-[1400px] mx-auto pb-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Budgeting vs Realizado</h1>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>Análise de desvios orçamentários e controle de gastos</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                        <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
                        <SaveDataButton dashboardType="orcamento" data={dados} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos!', type: 'success' })} onError={(e) => setToast({ message: `❌ ${e}`, type: 'error' })} />
                        <UpdateFromSheetsButton dashboardType="orcamento" onDataLoaded={(data) => { setDados(data as any); setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' }); }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
                        <ClearDataButton onClear={() => { setDados([]); setToast({ message: '🧹 Dados removidos.', type: 'info' }); }} compact />
                        <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.orcamento} />
                    </div>
                </div>

                {/* KPIs */}
                <div id="pdf-section-orcamento-kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <KPIOrcamentoCard
                        titulo="Total Orçado"
                        valor={totalOrcadoFiltrado}
                        unidade="R$"
                        cor="text-blue-400"
                        status="neutro"
                    />
                    <KPIOrcamentoCard
                        titulo="Total Realizado"
                        valor={totalRealizadoFiltrado}
                        unidade="R$"
                        cor={totalRealizadoFiltrado > totalOrcadoFiltrado ? "text-red-400" : "text-blue-400"}
                        status={totalRealizadoFiltrado > totalOrcadoFiltrado ? "negativo" : "positivo"}
                    />
                    <KPIOrcamentoCard
                        titulo="Variância Total"
                        valor={varianciaFiltrадa}
                        unidade="R$"
                        cor={varianciaFiltrадa > 0 ? "text-red-400" : "text-blue-400"}
                        status={varianciaFiltrадa > 0 ? "negativo" : "positivo"}
                    />
                    <KPIOrcamentoCard
                        titulo="Variância %"
                        valor={Math.abs(varianciaPercentualFiltrada)}
                        percentual={varianciaPercentualFiltrada}
                        unidade="%"
                        cor={varianciaPercentualFiltrada > 0 ? "text-red-400" : "text-blue-400"}
                        status={statusVarianciaFiltrada}
                    />
                    <KPIOrcamentoCard
                        titulo="Status"
                        valor={Math.abs(varianciaPercentualFiltrada)}
                        unidade="%"
                        cor={Math.abs(varianciaPercentualFiltrada) > 5 ? "text-red-400" : "text-blue-400"}
                        status={statusVarianciaFiltrada}
                    />
                </div>

                {/* Gráficos */}
                <div id="pdf-section-orcamento-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Orçado vs Realizado</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={formatCurrency} width={75} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="orcado" fill="#6366f1" name="Orçado" isAnimationActive={false} />
                                <Bar dataKey="realizado" fill="#14b8a6" name="Realizado" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Variância por Categoria</h2>
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
                <div id="pdf-section-orcamento-desvios" className="bg-surface-dark rounded-xl p-6 border border-border-dark overflow-hidden mb-6">
                    <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Desvios Críticos (variância &gt; 5%)</h2>
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
                                        <tr key={idx} className={`border-b transition-colors ${isDark ? 'border-border-dark hover:bg-background-dark/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.categoria}</td>
                                            <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.orcado)}</td>
                                            <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.realizado)}</td>
                                            <td className={`px-4 py-3 text-right font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.variancia)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`font-bold ${item.variancia > 0 ? 'text-red-400' : 'text-blue-400'}`}>
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
                <div id="pdf-section-orcamento-tabela" className="bg-surface-dark rounded-xl p-6 border border-border-dark overflow-hidden">
                    <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Detalhamento Completo</h2>
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
                                    <tr key={idx} className={`border-b transition-colors ${isDark ? 'border-border-dark hover:bg-background-dark/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.categoria}</td>
                                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.orcado)}</td>
                                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.realizado)}</td>
                                        <td className={`px-4 py-3 text-right font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.variancia)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`font-bold ${item.variancia > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                                {item.percentual > 0 ? '+' : ''}{item.percentual.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>-</td>
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
        <DataUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} dashboardType="orcamento" onManualUpload={async () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.xlsx,.xls'; input.onchange = async (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return; try { const result = await importFromExcel(file); setDados(result.firstSheet as any); markUserDataLoaded(); markDataSource('manual'); setToast({ message: `✅ ${result.rowCount} linhas carregadas!`, type: 'success' }); setShowUploadModal(false); } catch (err: any) { setToast({ message: `❌ ${err?.message || 'Erro'}`, type: 'error' }); } }; input.click(); }} onGoogleSheets={(data) => { setDados(data as any); markUserDataLoaded(); markDataSource('google_sheets'); setToast({ message: 'Google Sheets carregado!', type: 'success' }); }} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Patch: garantir validação sempre */}
        <DataUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            dashboardType="orcamento"
            onManualUpload={async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.xls';
                input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    try {
                        const result = await importFromExcel(file);
                        const validados = validarDadosOrcamento(result.firstSheet as any);
                        setDados(validados);
                        markUserDataLoaded();
                        markDataSource('manual');
                        setToast({ message: `✅ ${validados.length} linhas válidas carregadas!`, type: 'success' });
                        setShowUploadModal(false);
                    } catch (err: any) {
                        setToast({ message: `❌ ${err?.message || 'Erro'}`, type: 'error' });
                    }
                };
                input.click();
            }}
            onGoogleSheets={(data) => {
                const validados = validarDadosOrcamento(data as any);
                setDados(validados);
                markUserDataLoaded();
                markDataSource('google_sheets');
                setToast({ message: 'Google Sheets carregado!', type: 'success' });
            }}
        />
        </>
    );
};

export default DashboardOrcamento;
