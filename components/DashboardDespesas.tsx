
import React, { useState } from 'react';
import KPIGridDespesas from './KPIGridDespesas.tsx';
import DespesasPorCategoria from './Charts/DespesasPorCategoria.tsx';
import EvolucaoDespesasMensal from './Charts/EvolucaoDespesasMensal.tsx';
import ComparacaoPeriodos from './Charts/ComparacaoPeriodos.tsx';
import TabelaPlanoConta from './Charts/TabelaPlanoConta.tsx';
import DataInputSelector from './DataInputSelector.tsx';
import DataUploadModal from './DataUploadModal.tsx';
import InsertDataButton from './InsertDataButton.tsx';
import Toast from './Toast.tsx';
import SaveDataButton from './SaveDataButton.tsx';
import ClearDataButton from './ClearDataButton';
import { useDespesas } from '../context/DespesasContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { useUserPlan } from '@/hooks/useUserPlan';
import { importFromExcel } from '@/utils/excelUtils';
import { saveDataToHistory } from '@/utils/dataHistoryManager';
import { markUserDataLoaded } from '@/utils/userDataState';

const DashboardDespesas: React.FC = () => {
    const { dadosDespesas, carregarDadosDespesas } = useDespesas();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showDataInput, setShowDataInput] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    // Hook para pegar o plano do usuÃ¡rio
    const { userPlan, loading: planLoading } = useUserPlan();

    // Se nÃ£o houver dados, mostrar mensagem
    if (dadosDespesas.length === 0) {
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
                                Importe um arquivo Excel com dados de despesas para visualizar
                            </p>
                        </div>

                        {/* InformaÃ§Ãµes do Formato */}
                        <div className="rounded-2xl border border-gray-300 shadow-lg p-6 bg-white">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Formato Esperado: Analise_despesas_Exemplo.xlsx
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
                                            <td className="py-2 font-mono text-primary">Ano</td>
                                            <td>nÃºmero</td>
                                            <td>2025</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">MÃªs/Meses</td>
                                            <td>texto</td>
                                            <td>NOVEMBRO, JAN, FEV...</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">Empresa</td>
                                            <td>texto</td>
                                            <td>Empresa 1, Empresa 2</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">Projetado</td>
                                            <td>nÃºmero (R$)</td>
                                            <td>3.500.000</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">Real</td>
                                            <td>nÃºmero (R$)</td>
                                            <td>2.322.419</td>
                                        </tr>
                                        <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-primary">VariaÃ§Ã£o</td>
                                            <td>percentual</td>
                                            <td>-33,65%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-mono text-primary">AnÃ¡lise Vertical</td>
                                            <td>percentual</td>
                                            <td>46,55%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">Analise_despesas_Exemplo.xlsx</span></p>

                            {/* BotÃ£o Download */}
                            <a data-cta-button href="https://docs.google.com/spreadsheets/d/10mrkv9tlvAXRoooNEu5NSMG5sai7gcOXFpIEh9VyR1M/export?format=xlsx" download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
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
        <main id="dashboard-despesas-content" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background-dark">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full">
                {/* CabeÃ§alho da pÃ¡gina */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`${isDark ? 'text-white' : 'text-gray-900'} text-3xl font-bold mb-2`}>Análise de Despesas</h1>
                        <p className={`${isDark ? 'text-text-muted' : 'text-gray-600'}`}>
                            Visualize e compare as despesas da empresa ao longo do tempo
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <InsertDataButton
                            onClick={() => setShowUploadModal(true)}
                            disabled={planLoading}
                        />
                        <SaveDataButton
                            dashboardType="despesas"
                            data={dadosDespesas}
                            disabled={planLoading}
                            onSaveComplete={() => {
                                setToast({
                                    message: 'âœ… Dados salvos! SerÃ£o carregados automaticamente na prÃ³xima entrada.',
                                    type: 'success'
                                });
                            }}
                            onError={(error) => {
                                setToast({
                                    message: `âŒ Erro ao salvar: ${error}`,
                                    type: 'error'
                                });
                            }}
                        />
                        <ClearDataButton
                            onClear={() => {
                                carregarDadosDespesas([]);
                                setToast({
                                    message: 'ðŸ§¹ Dados removidos da interface.',
                                    type: 'info'
                                });
                            }}
                        />
                    </div>
                </div>

                {/* Modal de upload de dados */}
                <DataUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    dashboardType="despesas"
                    onManualUpload={async () => {
                        try {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.xlsx,.xls';
                            input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (!file) return;

                                try {
                                    const result = await importFromExcel(file);

                                    // Carregar dados no contexto (NÃƒO salva automaticamente)
                                    carregarDadosDespesas(result.firstSheet);
                                    markUserDataLoaded();

                                    setToast({
                                        message: `âœ… ${result.rowCount} linhas carregadas! Clique em "Salvar" para persistir.`,
                                        type: 'success'
                                    });
                                    setShowUploadModal(false);
                                } catch (error: any) {
                                    setToast({
                                        message: `Erro ao importar: ${error.message || 'Arquivo invÃ¡lido'}`,
                                        type: 'error'
                                    });
                                }
                            };
                            input.click();
                        } catch (error) {
                            setToast({
                                message: 'Erro ao abrir seletor de arquivo',
                                type: 'error'
                            });
                        }
                    }}
                    onGoogleSheets={(data) => {
                        carregarDadosDespesas(data);
                        markUserDataLoaded();
                        setToast({
                            message: 'Dados do Google Sheets carregados com sucesso!',
                            type: 'success'
                        });
                    }}
                />

                {/* Toast de notificaÃ§Ã£o */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Modal de seleÃ§Ã£o de fonte de dados (antigo) */}
                {showDataInput && (
                    <DataInputSelector
                        userId={userPlan.userId || ''}
                        dashboardType="Despesas"
                        onManual={() => {
                            setShowDataInput(false);
                            alert('Excel uploader serÃ¡ integrado aqui');
                        }}
                        onGoogleSheets={() => {
                            setShowDataInput(false);
                            alert('Google Sheets serÃ¡ integrado aqui');
                        }}
                        onClose={() => setShowDataInput(false)}
                    />
                )}

                {/* KPIs */}
                <KPIGridDespesas />

                {/* GrÃ¡ficos principais */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                    <EvolucaoDespesasMensal />
                    <DespesasPorCategoria />
                </div>

                {/* ComparaÃ§Ã£o de perÃ­odos - largura total */}
                <div className="w-full">
                    <ComparacaoPeriodos />
                </div>

                {/* Tabela de Plano de Contas - largura total */}
                <div className="w-full">
                    <TabelaPlanoConta />
                </div>

                {/* EspaÃ§o para exportaÃ§Ã£o PDF */}
                <div className="pb-12"></div>
            </div>
        </main>
    );
};

export default DashboardDespesas;


