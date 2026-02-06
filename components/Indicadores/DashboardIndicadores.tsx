import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useIndicadores } from '../../context/IndicadoresContext/IndicadoresContext';
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

interface KPIIndicadorCardProps {
    titulo: string;
    valor: number;
    benchmark?: number;
    unidade: string;
    cor: string;
    status: 'bom' | 'regular' | 'ruim';
}

const KPIIndicadorCard: React.FC<KPIIndicadorCardProps> = ({ titulo, valor, benchmark, unidade, cor, status }) => {
    const { theme } = useTheme();
    const isDarkCard = theme === 'dark';

    return (
        <div className={`${isDarkCard ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-lg p-4 border shadow-sm`}>
            <p className={`${isDarkCard ? 'text-gray-400' : 'text-gray-900'} text-sm`}>{titulo}</p>
            <p className={`text-2xl font-bold ${isDarkCard ? cor : 'text-gray-900'}`}>{valor.toFixed(2)}%</p>
            {benchmark && <p className={`text-xs ${isDarkCard ? 'text-gray-500' : 'text-gray-900'}`}>Setor: {benchmark.toFixed(2)}%</p>}
            <div className={`mt-2 h-1 w-full rounded ${status === 'bom' ? 'bg-blue-600' : status === 'regular' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
        </div>
    );
};

const DashboardIndicadores: React.FC = () => {
    const { dados, setDados, indicadores, empresas, obterComparativoSetor } = useIndicadores();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [chartData, setChartData] = useState<any[]>([]);
    const [radarData, setRadarData] = useState<any[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    useEffect(() => {
        const empresa = selectedEmpresa || (empresas.length > 0 ? empresas[0] : '');
        const filtered = empresa ? dados.filter(d => d.empresa === empresa) : [];

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
                                Importe um arquivo Excel com dados de indicadores para visualizar
                            </p>
                        </div>

                        {/* Informações do Formato */}
                        <div className="rounded-2xl border border-gray-300 shadow-lg p-6 bg-white">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Formato Esperado: Indicadores_Exemplo.xlsx
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
                                            <td className="py-2 font-mono text-primary">roe</td>
                                            <td>número (%)</td>
                                            <td>15.3, 18.2...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">roa</td>
                                            <td>número (%)</td>
                                            <td>8.2, 9.1...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">margemLiquida</td>
                                            <td>número (%)</td>
                                            <td>12.5, 14.2...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
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
                            <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">Indicadores_Exemplo.xlsx</span></p>

                            <a data-cta-button href={DASHBOARD_TEMPLATE_URLS.indicadores} download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                                <span className="material-symbols-outlined text-base">download</span>
                                Baixar Arquivo
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-8 justify-center items-center">
                            <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
                            <SaveDataButton dashboardType="indicadores" data={[]} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos!', type: 'success' })} onError={(e) => setToast({ message: `❌ ${e}`, type: 'error' })} />
                            <UpdateFromSheetsButton dashboardType="indicadores" onDataLoaded={(data) => { setDados(data as any); setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' }); }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
                            <ClearDataButton onClear={() => setDados([])} compact />
                            <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.indicadores} />
                        </div>
                    </div>
                </div>
            </div>
            <DataUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} dashboardType="indicadores" onManualUpload={async () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.xlsx,.xls'; input.onchange = async (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return; try { const result = await importFromExcel(file); setDados(result.firstSheet as any); markUserDataLoaded(); markDataSource('manual'); setToast({ message: `✅ ${result.rowCount} linhas carregadas!`, type: 'success' }); setShowUploadModal(false); } catch (err: any) { setToast({ message: `❌ ${err?.message || 'Erro'}`, type: 'error' }); } }; input.click(); }} onGoogleSheets={(data) => { setDados(data as any); markUserDataLoaded(); markDataSource('google_sheets'); setToast({ message: 'Google Sheets carregado!', type: 'success' }); }} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
        );
    }

    const roe_setor_calc = obterComparativoSetor('roe').benchmarkSetor;
    const roa_setor_calc = obterComparativoSetor('roa').benchmarkSetor;
    const margem_setor_calc = obterComparativoSetor('margemLiquida').benchmarkSetor;

    return (
        <>
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-gray-50'} min-h-screen`}>
            <div className="max-w-[1400px] mx-auto pb-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Indicadores Financeiros</h1>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>Análise de saúde financeira com benchmarks do setor</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                        <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
                        <SaveDataButton dashboardType="indicadores" data={dados} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos!', type: 'success' })} onError={(e) => setToast({ message: `❌ ${e}`, type: 'error' })} />
                        <UpdateFromSheetsButton dashboardType="indicadores" onDataLoaded={(data) => { setDados(data as any); setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' }); }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
                        <ClearDataButton onClear={() => { setDados([]); setToast({ message: '🧹 Dados removidos.', type: 'info' }); }} compact />
                        <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.indicadores} />
                    </div>
                </div>

                {/* KPIs */}
                <div id="pdf-section-indicadores-kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                        cor="text-blue-400"
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
                        cor={indicadores.endividamento > 60 ? "text-red-400" : "text-blue-400"}
                        status={indicadores.endividamento > 60 ? 'ruim' : 'bom'}
                    />
                </div>

                {/* Gráficos */}
                <div id="pdf-section-indicadores-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
                        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Evolução de Indicadores</h2>
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
                        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Saúde Geral</h2>
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
                <div id="pdf-section-indicadores-tabela" className="bg-surface-dark rounded-xl p-6 border border-border-dark overflow-hidden">
                    <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Detalhamento</h2>
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
                                    <tr key={idx} className={`border-b transition-colors ${isDark ? 'border-border-dark hover:bg-background-dark/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.empresa}</td>
                                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.roe.toFixed(2)}</td>
                                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.roa.toFixed(2)}</td>
                                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.margemLiquida.toFixed(2)}</td>
                                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.liquidezCorrente.toFixed(2)}</td>
                                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.endividamento.toFixed(2)}</td>
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
        <DataUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} dashboardType="indicadores" onManualUpload={async () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.xlsx,.xls'; input.onchange = async (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return; try { const result = await importFromExcel(file); setDados(result.firstSheet as any); markUserDataLoaded(); markDataSource('manual'); setToast({ message: `✅ ${result.rowCount} linhas carregadas!`, type: 'success' }); setShowUploadModal(false); } catch (err: any) { setToast({ message: `❌ ${err?.message || 'Erro'}`, type: 'error' }); } }; input.click(); }} onGoogleSheets={(data) => { setDados(data as any); markUserDataLoaded(); markDataSource('google_sheets'); setToast({ message: 'Google Sheets carregado!', type: 'success' }); }} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default DashboardIndicadores;
