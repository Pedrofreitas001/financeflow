import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useBalancete } from '../../context/BalanceteContext';
import MapaPatrimonial from './MapaPatrimonial';
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
import SnapshotExecutivo from './SnapshotExecutivo';
import PiramideSolidez from './PiramideSolidez';
import RankingContas from './RankingContas';

interface KPIBalanceteCardProps {
    titulo: string;
    valor: number;
    unidade?: string;
    cor: string;
    status: 'ok' | 'alerta' | 'erro';
}

const KPIBalanceteCard: React.FC<KPIBalanceteCardProps> = ({ titulo, valor, unidade = 'R$', cor, status }) => {
    const { theme } = useTheme();
    const isDarkCard = theme === 'dark';

    const statusColor = status === 'ok' ? 'bg-blue-500/20 text-blue-400' : status === 'alerta' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400';
    const statusIcon = status === 'ok' ? '✓' : status === 'alerta' ? '⚠' : '✕';

    return (
        <div className={`${isDarkCard ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl p-5 border shadow-lg hover:shadow-xl hover:border-primary/50 transition-all`}>
            <p className={`${isDarkCard ? 'text-text-muted' : 'text-gray-900'} text-xs font-medium uppercase tracking-wide`}>{titulo}</p>
            <p className={`text-2xl font-bold ${isDarkCard ? cor : 'text-gray-900'} mt-2 tracking-tight`}>
                {unidade === 'R$' ? `R$ ${(valor / 1000000).toFixed(2)}M` : `${valor.toFixed(2)}%`}
            </p>
            <div className={`mt-3 px-3 py-1 rounded-full w-fit text-xs font-semibold flex items-center gap-1 ${statusColor}`}>
                <span>{statusIcon}</span>
                <span>{status === 'ok' ? 'OK' : status === 'alerta' ? 'Atenção' : 'Erro'}</span>
            </div>
        </div>
    );
};

const DashboardBalancete: React.FC = () => {
    const { dados, setDados, obterTotalAtivo, obterTotalPassivo, obterTotalPL, obterBalanceteOk, obterAtivoCirculante, obterAtivoNaoCirculante, obterPassivoCirculante, obterPassivoNaoCirculante, empresas, empresaSelecionada, setEmpresaSelecionada } = useBalancete();

    // Validação dos dados do Balancete
    function validarDadosBalancete(rows: any[]): ContaBalancete[] {
        if (!Array.isArray(rows)) return [];
        const validos: ContaBalancete[] = [];
        const descartados: any[] = [];
        rows.forEach((row, idx) => {
            try {
                const data = row?.Data ?? row?.data;
                const contaContabil = row?.['Conta Contábil'] ?? row?.contaContabil;
                const nomeContaContabil = row?.['Nome Conta'] ?? row?.nomeContaContabil;
                const grupo = row?.Grupo ?? row?.grupo;
                let subgrupo = row?.Subgrupo ?? row?.subgrupo;
                // Normalizar subgrupo para garantir valores válidos
                if (typeof subgrupo === 'string') {
                    const original = subgrupo;
                    subgrupo = subgrupo.trim().toLowerCase();
                    // Detectar "Não Circulante" antes de "Circulante" para evitar conflito
                    if (/n[aã]o\s*circulante/i.test(original) || subgrupo.includes('não circulante') || subgrupo.includes('nao circulante')) {
                        subgrupo = 'Não Circulante';
                    } else if (subgrupo.includes('circulante')) {
                        subgrupo = 'Circulante';
                    } else if (subgrupo.includes('capital')) {
                        subgrupo = 'Capital';
                    } else if (subgrupo.includes('reservas')) {
                        subgrupo = 'Reservas';
                    } else if (subgrupo.includes('resultados')) {
                        subgrupo = 'Resultados';
                    } else {
                        subgrupo = original;
                    }
                } else {
                    subgrupo = '';
                }
                const saldoRaw = row?.Saldo ?? row?.saldo;
                const totalDebitosRaw = row?.['Total Débitos'] ?? row?.totalDebitos;
                const totalCreditosRaw = row?.['Total Créditos'] ?? row?.totalCreditos;
                const saldo = typeof saldoRaw === 'string' ? parseFloat(saldoRaw.replace(/[^0-9\-.,]/g, '').replace(',', '.')) : Number(saldoRaw);
                const totalDebitos = typeof totalDebitosRaw === 'string' ? parseFloat(totalDebitosRaw.replace(/[^0-9\-.,]/g, '').replace(',', '.')) : Number(totalDebitosRaw);
                const totalCreditos = typeof totalCreditosRaw === 'string' ? parseFloat(totalCreditosRaw.replace(/[^0-9\-.,]/g, '').replace(',', '.')) : Number(totalCreditosRaw);
                const empresa = row?.Empresa ?? row?.empresa;
                if (data && contaContabil && nomeContaContabil && grupo && !isNaN(saldo) && empresa) {
                    validos.push({
                        ...row,
                        saldo,
                        totalDebitos,
                        totalCreditos,
                        contaContabil,
                        nomeContaContabil,
                        grupo,
                        subgrupo,
                        empresa,
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
            console.warn('[Balancete] Dados descartados na validação:', descartados);
        }
        if (validos.length === 0) {
            // eslint-disable-next-line no-console
            console.error('[Balancete] Nenhum dado válido encontrado. Verifique as colunas e os valores do Excel.');
        }
        return validos;
    }
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    const [filtroGrupo, setFiltroGrupo] = useState<string>('Todos');
    const [filtroSubgrupo, setFiltroSubgrupo] = useState<string>('Todos');
    const [ordenacao, setOrdenacao] = useState<'conta' | 'saldo'>('conta');

    // Se não houver dados, mostrar disclaimer
    if (!dados || dados.length === 0) {
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
                                    Importe um arquivo Excel com dados de balancete para visualizar
                                </p>
                            </div>

                            {/* Informações do Formato */}
                            <div className="rounded-2xl border border-gray-300 shadow-lg p-6 bg-white">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                    Formato Esperado: Balancete_exemplo.xlsx
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
                                            <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                                <td className="py-2 font-mono text-primary">Data</td>
                                                <td>data</td>
                                                <td>2024-12-31</td>
                                            </tr>
                                            <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                                <td className="py-2 font-mono text-primary">Conta Contábil</td>
                                                <td>texto</td>
                                                <td>1.1.1.01, 1.1.2.01...</td>
                                            </tr>
                                            <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                                <td className="py-2 font-mono text-primary">Nome Conta</td>
                                                <td>texto</td>
                                                <td>Caixa, Banco, Fornecedores...</td>
                                            </tr>
                                            <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                                <td className="py-2 font-mono text-primary">Grupo</td>
                                                <td>Ativo/Passivo/PL</td>
                                                <td>Ativo, Passivo, PL</td>
                                            </tr>
                                            <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                                <td className="py-2 font-mono text-primary">Saldo</td>
                                                <td>moeda (R$)</td>
                                                <td>150000, 450000...</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">Balancete_exemplo.xlsx</span></p>

                                <a data-cta-button href={DASHBOARD_TEMPLATE_URLS.balancete} download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                                    <span className="material-symbols-outlined text-base">download</span>
                                    Baixar Arquivo
                                </a>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-8 justify-center items-center">
                                <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
                                <SaveDataButton dashboardType="balancete" data={[]} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos!', type: 'success' })} onError={(e) => setToast({ message: `❌ ${e}`, type: 'error' })} />
                                <UpdateFromSheetsButton dashboardType="balancete" onDataLoaded={(data) => { setDados(data as any); setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' }); }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
                                <ClearDataButton onClear={() => setDados([])} compact />
                                <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.balancete} />
                            </div>
                        </div>
                    </div>
                </div>
                <DataUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    dashboardType="balancete"
                    onManualUpload={async () => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            try {
                                const result = await importFromExcel(file);
                                const dadosValidos = validarDadosBalancete(result.firstSheet);
                                if (dadosValidos.length === 0) {
                                    setToast({ message: '❌ Arquivo vazio ou sem dados válidos para Balancete.', type: 'error' });
                                    return;
                                }
                                setDados(dadosValidos);
                                markUserDataLoaded();
                                markDataSource('manual');
                                setToast({ message: `✅ ${dadosValidos.length} linhas carregadas!`, type: 'success' });
                                setShowUploadModal(false);
                            } catch (err: any) {
                                setToast({ message: `❌ ${err?.message || 'Erro ao importar arquivo Balancete'}`, type: 'error' });
                            }
                        };
                        input.click();
                    }}
                    onGoogleSheets={(data) => {
                        const dadosValidos = validarDadosBalancete(data);
                        if (dadosValidos.length === 0) {
                            setToast({ message: '❌ Dados do Google Sheets inválidos para Balancete.', type: 'error' });
                            return;
                        }
                        setDados(dadosValidos);
                        markUserDataLoaded();
                        markDataSource('google_sheets');
                        setToast({ message: 'Google Sheets carregado!', type: 'success' });
                    }}
                />
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    // Função auxiliar para formatar valores (K para mil, M para milhão)
    const formatarValor = (valor: number): string => {
        if (Math.abs(valor) >= 1000000) {
            return `R$ ${(valor / 1000000).toFixed(2)}M`;
        } else if (Math.abs(valor) >= 1000) {
            return `R$ ${(valor / 1000).toFixed(0)}k`;
        }
        return `R$ ${valor.toFixed(2)}`;
    };

    // Usar dados já filtrados do contexto
    const totalAtivo = obterTotalAtivo();
    const totalPassivo = obterTotalPassivo();
    const totalPL = obterTotalPL();
    const ativoCirculante = obterAtivoCirculante();
    const ativoNaoCirculante = obterAtivoNaoCirculante();
    const passivoCirculante = obterPassivoCirculante();
    const passivoNaoCirculante = obterPassivoNaoCirculante();
    const balanceteOk = obterBalanceteOk();
    const dataAtivoDistribuicao = [
        { name: 'Circulante', value: ativoCirculante, color: '#10b981' },
        { name: 'Não Circulante', value: ativoNaoCirculante, color: '#3b82f6' }
    ];

    // Dados para gráfico de distribuição do Passivo
    const dataPassivoDistribuicao = [
        { name: 'Circulante', value: passivoCirculante, color: '#f59e0b' },
        { name: 'Não Circulante', value: passivoNaoCirculante, color: '#8b5cf6' }
    ];

    // Dados para gráfico de Proporção Passivo x PL
    const dataProportao = [
        { name: 'Passivo', value: totalPassivo, color: '#ef4444' },
        { name: 'PL', value: totalPL, color: '#06b6d4' }
    ];

    // Filtrar e ordenar dados da tabela
    let dadosFiltrados = dados.filter(d => {
        if (filtroGrupo !== 'Todos' && d.grupo !== filtroGrupo) return false;
        if (filtroSubgrupo !== 'Todos' && d.subgrupo !== filtroSubgrupo) return false;
        return true;
    });

    if (ordenacao === 'saldo') {
        dadosFiltrados.sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo));
    } else {
        dadosFiltrados.sort((a, b) => {
            const ca = a.contaContabil || '';
            const cb = b.contaContabil || '';
            return ca.localeCompare(cb);
        });
    }

    // Grupos e subgrupos únicos
    const grupos = Array.from(new Set(dados.map(d => d.grupo)));
    const subgrupos = filtroGrupo === 'Todos'
        ? Array.from(new Set(dados.map(d => d.subgrupo)))
        : Array.from(new Set(dados.filter(d => d.grupo === filtroGrupo).map(d => d.subgrupo)));

    const handleExportarCSV = () => {
        const headers = ['Data', 'Conta', 'Nome', 'Grupo', 'Subgrupo', 'Total Débitos', 'Total Créditos', 'Saldo', 'Status'];
        const rows = dadosFiltrados.map(d => [
            d.data,
            d.contaContabil,
            d.nomeContaContabil,
            d.grupo,
            d.subgrupo,
            d.totalDebitos,
            d.totalCreditos,
            d.saldo,
            d.status
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.join(',') + '\n';
        });

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        element.setAttribute('download', 'balancete.csv');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <>
            <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                <div className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full">
                    {/* Cabeçalho */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Balancete Contábil
                            </h1>
                            <p className={`${isDark ? 'text-text-muted' : 'text-gray-600'}`}>
                                Posição patrimonial consolidada da empresa
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                            <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
                            <SaveDataButton dashboardType="balancete" data={dados || []} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos!', type: 'success' })} onError={(e) => setToast({ message: `❌ ${e}`, type: 'error' })} />
                            <UpdateFromSheetsButton dashboardType="balancete" onDataLoaded={(data) => { setDados(data as any); setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' }); }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
                            <ClearDataButton onClear={() => { setDados([]); setToast({ message: '🧹 Dados removidos.', type: 'info' }); }} compact />
                            <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.balancete} />
                        </div>
                    </div>

                    {/* Selector de Empresa */}
                    {dados && dados.length > 0 && Array.from(new Set(dados.map(d => d.empresa))).length > 1 && (
                        <div className="flex items-center gap-4">
                            <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Selecionar Empresa:
                            </label>
                            <select
                                value={empresaSelecionada}
                                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                                className={`px-4 py-2 rounded border text-sm ${isDark
                                    ? 'bg-surface-dark border-border-dark text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:border-primary`}
                            >
                                {Array.from(new Set(dados.map(d => d.empresa))).map(empresa => (
                                    <option key={empresa} value={empresa}>{empresa}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* KPIs Principais */}
                    <div>
                        <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Indicadores Principais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <KPIBalanceteCard
                                titulo="Ativo Total"
                                valor={totalAtivo}
                                cor="text-blue-400"
                                status="ok"
                            />
                            <KPIBalanceteCard
                                titulo="Passivo Total"
                                valor={totalPassivo}
                                cor="text-red-400"
                                status="ok"
                            />
                            <KPIBalanceteCard
                                titulo="Patrimônio Líquido"
                                valor={totalPL}
                                cor="text-blue-400"
                                status="ok"
                            />
                            <KPIBalanceteCard
                                titulo="Ativo Circulante"
                                valor={ativoCirculante}
                                cor="text-blue-400"
                                status="ok"
                            />
                            <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-lg p-4 border shadow-sm flex flex-col justify-center items-center text-center`}>
                                <p className={`${isDark ? 'text-gray-400' : 'text-gray-900'} text-sm mb-2`}>Status Balancete</p>
                                <div className={`px-3 py-2 rounded-full font-bold text-sm ${balanceteOk ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {balanceteOk ? '✓ Balanceado' : '✕ Desequilibrado'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Distribuição do Ativo */}
                        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg p-6 flex flex-col h-[380px]`}>
                            <h3 className={`text-sm font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Distribuição do Ativo
                            </h3>
                            <div className="flex items-center h-full min-h-0 gap-4">
                                <div className="w-[50%] h-full relative min-h-[200px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dataAtivoDistribuicao}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="55%"
                                                outerRadius="90%"
                                                paddingAngle={5}
                                                dataKey="value"
                                                isAnimationActive
                                                animationBegin={100}
                                                animationDuration={900}
                                                animationEasing="ease-out"
                                                stroke="none"
                                            >
                                                {dataAtivoDistribuicao.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className={`text-xs font-black drop-shadow-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {totalAtivo > 1000000 ? `R$ ${(totalAtivo / 1000000).toFixed(1)}M` : `R$ ${(totalAtivo / 1000).toFixed(0)}k`}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-[50%] flex flex-col justify-center">
                                    <div className="flex flex-col gap-4">
                                        {dataAtivoDistribuicao.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 group w-full">
                                                <span className={`h-3 w-3 rounded-full shrink-0 border ${isDark ? 'border-white/5' : 'border-gray-300/30'}`} style={{ backgroundColor: item.color }}></span>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="flex justify-between items-center w-full gap-2">
                                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-semibold uppercase tracking-wider truncate`}>
                                                            {item.name}
                                                        </span>
                                                        <span className="text-xs text-primary font-bold shrink-0">
                                                            {((item.value / totalAtivo) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Distribuição do Passivo */}
                        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg p-6 flex flex-col h-[380px]`}>
                            <h3 className={`text-sm font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Distribuição do Passivo
                            </h3>
                            <div className="flex items-center h-full min-h-0 gap-4">
                                <div className="w-[50%] h-full relative min-h-[200px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dataPassivoDistribuicao}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="55%"
                                                outerRadius="90%"
                                                paddingAngle={5}
                                                dataKey="value"
                                                isAnimationActive
                                                animationBegin={120}
                                                animationDuration={900}
                                                animationEasing="ease-out"
                                                stroke="none"
                                            >
                                                {dataPassivoDistribuicao.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className={`text-xs font-black drop-shadow-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {totalPassivo > 1000000 ? `R$ ${(totalPassivo / 1000000).toFixed(1)}M` : `R$ ${(totalPassivo / 1000).toFixed(0)}k`}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-[50%] flex flex-col justify-center">
                                    <div className="flex flex-col gap-4">
                                        {dataPassivoDistribuicao.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 group w-full">
                                                <span className={`h-3 w-3 rounded-full shrink-0 border ${isDark ? 'border-white/5' : 'border-gray-300/30'}`} style={{ backgroundColor: item.color }}></span>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="flex justify-between items-center w-full gap-2">
                                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-semibold uppercase tracking-wider truncate`}>
                                                            {item.name}
                                                        </span>
                                                        <span className="text-xs text-primary font-bold shrink-0">
                                                            {((item.value / totalPassivo) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Proporção Passivo x PL */}
                        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg p-6 flex flex-col h-[380px]`}>
                            <h3 className={`text-sm font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Proporção Passivo x PL
                            </h3>
                            <div className="flex items-center h-full min-h-0 gap-4">
                                <div className="w-[50%] h-full relative min-h-[200px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dataProportao}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="55%"
                                                outerRadius="90%"
                                                paddingAngle={5}
                                                dataKey="value"
                                                isAnimationActive
                                                animationBegin={140}
                                                animationDuration={900}
                                                animationEasing="ease-out"
                                                stroke="none"
                                            >
                                                {dataProportao.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `R$ ${(value / 1000000).toFixed(2)}M`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className={`text-xs font-black drop-shadow-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {(totalPassivo + totalPL) > 1000000 ? `R$ ${((totalPassivo + totalPL) / 1000000).toFixed(1)}M` : `R$ ${((totalPassivo + totalPL) / 1000).toFixed(0)}k`}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-[50%] flex flex-col justify-center">
                                    <div className="flex flex-col gap-4">
                                        {dataProportao.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 group w-full">
                                                <span className={`h-3 w-3 rounded-full shrink-0 border ${isDark ? 'border-white/5' : 'border-gray-300/30'}`} style={{ backgroundColor: item.color }}></span>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="flex justify-between items-center w-full gap-2">
                                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-semibold uppercase tracking-wider truncate`}>
                                                            {item.name}
                                                        </span>
                                                        <span className="text-xs text-primary font-bold shrink-0">
                                                            {((item.value / (totalPassivo + totalPL)) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Novos Componentes Executivos */}
                    <div className="space-y-8">
                        {/* Snapshot Executivo */}
                        <SnapshotExecutivo
                            dados={dados}
                            empresas={empresas}
                            totais={{
                                ativo: totalAtivo,
                                passivo: totalPassivo,
                                pl: totalPL,
                                ativoCirculante: ativoCirculante,
                                ativoNaoCirculante: ativoNaoCirculante,
                                passivoCirculante: passivoCirculante,
                                passivoNaoCirculante: passivoNaoCirculante,
                            }}
                        />

                        {/* Mapa Patrimonial */}
                        <MapaPatrimonial
                            dados={dados}
                            empresas={empresas}
                            totais={{
                                ativo: totalAtivo,
                                passivo: totalPassivo,
                                pl: totalPL,
                            }}
                        />

                        {/* Pirâmide de Solidez */}
                        <PiramideSolidez
                            empresas={empresas}
                            totais={{
                                ativo: totalAtivo,
                                passivo: totalPassivo,
                                pl: totalPL,
                                passivoCirculante: passivoCirculante,
                                passivoNaoCirculante: passivoNaoCirculante,
                            }}
                        />

                        {/* Ranking de Contas Críticas */}
                        <RankingContas
                            dados={dados}
                            empresas={empresas}
                        />
                    </div>

                    {/* Tabela de Balancete */}
                    <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg overflow-hidden`}>
                        <div className="p-6 border-b border-border-dark">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Tabela de Balancete
                                </h3>
                                <button
                                    onClick={handleExportarCSV}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded hover:bg-primary/20 transition-colors"
                                >
                                    ↓ Exportar CSV
                                </button>
                            </div>

                            {/* Filtros */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Grupo
                                    </label>
                                    <select
                                        value={filtroGrupo}
                                        onChange={(e) => {
                                            setFiltroGrupo(e.target.value);
                                            setFiltroSubgrupo('Todos');
                                        }}
                                        className={`w-full px-3 py-2 rounded border ${isDark
                                            ? 'bg-background-dark border-border-dark text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } text-sm focus:outline-none focus:border-primary`}
                                    >
                                        <option value="Todos">Todos</option>
                                        {grupos.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Subgrupo
                                    </label>
                                    <select
                                        value={filtroSubgrupo}
                                        onChange={(e) => setFiltroSubgrupo(e.target.value)}
                                        className={`w-full px-3 py-2 rounded border ${isDark
                                            ? 'bg-background-dark border-border-dark text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } text-sm focus:outline-none focus:border-primary`}
                                    >
                                        <option value="Todos">Todos</option>
                                        {subgrupos.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Ordenação
                                    </label>
                                    <select
                                        value={ordenacao}
                                        onChange={(e) => setOrdenacao(e.target.value as 'conta' | 'saldo')}
                                        className={`w-full px-3 py-2 rounded border ${isDark
                                            ? 'bg-background-dark border-border-dark text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            } text-sm focus:outline-none focus:border-primary`}
                                    >
                                        <option value="conta">Por Conta</option>
                                        <option value="saldo">Por Saldo (maior)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Tabela */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
                                        <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Conta
                                        </th>
                                        <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Nome
                                        </th>
                                        <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Grupo
                                        </th>
                                        <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Débitos
                                        </th>
                                        <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Créditos
                                        </th>
                                        <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Saldo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosFiltrados.map((conta, idx) => (
                                        <tr
                                            key={idx}
                                            className={`border-b transition-colors ${isDark
                                                ? 'border-border-dark hover:bg-background-dark'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className={`px-6 py-3 font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {conta.contaContabil}
                                            </td>
                                            <td className={`px-6 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {conta.nomeContaContabil}
                                            </td>
                                            <td className={`px-6 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${conta.grupo === 'Ativo'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : conta.grupo === 'Passivo'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {conta.grupo}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                R$ {(conta.totalDebitos ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className={`px-6 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                R$ {(conta.totalCreditos ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className={`px-6 py-3 text-right font-semibold ${conta.saldo >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                                R$ {(conta.saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Resumo */}
                        <div className={`px-6 py-4 border-t ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex justify-center">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-fit">
                                    <div className="text-center">
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Débitos</p>
                                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            R$ {dadosFiltrados.reduce((acc, d) => acc + (d.totalDebitos ?? 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Créditos</p>
                                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            R$ {dadosFiltrados.reduce((acc, d) => acc + (d.totalCreditos ?? 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Saldos</p>
                                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            R$ {dadosFiltrados.reduce((acc, d) => acc + (d.saldo ?? 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Registros</p>
                                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {dadosFiltrados.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Espaço para exportação PDF */}
                    <div className="pb-12"></div>
                </div>
            </main>
            <DataUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                dashboardType="balancete"
                onManualUpload={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.xlsx,.xls';
                    input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        try {
                            const result = await importFromExcel(file);
                            const dadosValidos = validarDadosBalancete(result.firstSheet);
                            if (dadosValidos.length === 0) {
                                setToast({ message: '❌ Arquivo vazio ou sem dados válidos para Balancete.', type: 'error' });
                                return;
                            }
                            setDados(dadosValidos);
                            markUserDataLoaded();
                            markDataSource('manual');
                            setToast({ message: `✅ ${dadosValidos.length} linhas carregadas!`, type: 'success' });
                            setShowUploadModal(false);
                        } catch (err: any) {
                            setToast({ message: `❌ ${err?.message || 'Erro'}`, type: 'error' });
                        }
                    };
                    input.click();
                }}
                onGoogleSheets={(data) => {
                    const dadosValidos = validarDadosBalancete(data);
                    if (dadosValidos.length === 0) {
                        setToast({ message: '❌ Dados do Google Sheets inválidos para Balancete.', type: 'error' });
                        return;
                    }
                    setDados(dadosValidos);
                    markUserDataLoaded();
                    markDataSource('google_sheets');
                    setToast({ message: 'Google Sheets carregado!', type: 'success' });
                }}
            />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default DashboardBalancete;
