import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDRE } from '../context/DREContext';
import DREFilters from './DRETables/DREFilters';
import DREMensalTable from './DRETables/DREMensalTable';
import DREAcumuladoTable from './DRETables/DREAcumuladoTable';
import DREComparativoTable from './DRETables/DREComparativoTable';
import DataUploadModal from './DataUploadModal';
import InsertDataButton from './InsertDataButton';
import SaveDataButton from './SaveDataButton';
import ClearDataButton from './ClearDataButton';
import UpdateFromSheetsButton from './UpdateFromSheetsButton';
import DownloadTemplateButton from './DownloadTemplateButton';
import { DASHBOARD_TEMPLATE_URLS } from '@/utils/dashboardTemplateUrls';
import Toast from './Toast';
import { markDataSource, markUserDataLoaded } from '@/utils/userDataState';

type ViewType = 'mensal' | 'acumulado' | 'comparativo';

const DREDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { dreData, loading, error, setDados, carregarDREMensal } = useDRE();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [viewType, setViewType] = useState<ViewType>('mensal');
  const isDark = theme === 'dark';

  if (!dreData || (dreData && Object.keys(dreData).length === 0)) {
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
                  Importe um arquivo Excel com dados da DRE para visualizar
                </p>
              </div>
              {/* Informações do Formato */}
              <div className="rounded-2xl border border-gray-300 shadow-lg p-6 bg-white">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Formato Esperado: Dashboard_Financeiro_Exemplo.xlsx
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
                        <td className="py-2 font-mono text-primary">Empresa</td>
                        <td>texto</td>
                        <td>CloudTech Industries, TechSolutions...</td>
                      </tr>
                      <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                        <td className="py-2 font-mono text-primary">Ano</td>
                        <td>número</td>
                        <td>2025</td>
                      </tr>
                      <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                        <td className="py-2 font-mono text-primary">Mês</td>
                        <td>texto</td>
                        <td>Janeiro, Fevereiro, Março...</td>
                      </tr>
                      <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                        <td className="py-2 font-mono text-primary">Categoria</td>
                        <td>texto</td>
                        <td>Custo Fixo, Faturamento, Imposto, Margem, RESULTADO...</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-primary">Valor</td>
                        <td>moeda (R$)</td>
                        <td>R$ 381.305,69</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">Dashboard_Financeiro_Exemplo.xlsx</span></p>
                <a data-cta-button href="https://docs.google.com/spreadsheets/d/1najlHXbyJLlXJSB12xPWHXi4rRS0kWDtMew301HjitQ/export?format=xlsx" download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                  <span className="material-symbols-outlined text-base">download</span>
                  Baixar Arquivo
                </a>
              </div>
              {/* Botões de ação no estado vazio */}
              <div className="flex flex-wrap gap-1.5 mt-8 justify-center items-center">
                <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
                <SaveDataButton dashboardType="dre" data={[]} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos!', type: 'success' })} onError={(e) => setToast({ message: `❌ ${e}`, type: 'error' })} />
                <UpdateFromSheetsButton dashboardType="dre" onDataLoaded={(data) => { setDados((Array.isArray(data) ? data : [data]) as any); setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' }); }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
                <ClearDataButton onClear={() => setDados(null as any)} compact />
                <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.dre} />
              </div>
            </div>
          </div>
        </div>
        <DataUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          dashboardType="dre"
          onManualUpload={async () => {
            try {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx,.xls';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                try {
                  await carregarDREMensal(file);
                  markUserDataLoaded();
                  markDataSource('manual');
                  setToast({ message: `✅ Arquivo carregado! Clique em "Salvar" para persistir.`, type: 'success' });
                  setShowUploadModal(false);
                } catch (error: any) {
                  setToast({ message: `❌ ${error?.message || 'Erro ao importar arquivo'}`, type: 'error' });
                }
              };
              input.click();
            } catch {
              setToast({ message: 'Erro ao abrir seletor de arquivo', type: 'error' });
            }
          }}
          onGoogleSheets={(data) => {
            setDados(data);
            markUserDataLoaded();
            markDataSource('google_sheets');
            setToast({ message: 'Dados do Google Sheets carregados!', type: 'success' });
          }}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  // Renderização principal
  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
      <div className="max-w-[1600px] mx-auto">
        {/* Filtros Horizontais */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Tabelas DRE
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Demonstração do Resultado do Exercício - Análise Detalhada
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <InsertDataButton onClick={() => setShowUploadModal(true)} compact />
              <SaveDataButton dashboardType="dre" data={dreData ? [dreData] : []} compact onSaveComplete={() => setToast({ message: '✅ Dados salvos! Serão carregados automaticamente na próxima entrada.', type: 'success' })} onError={(error) => setToast({ message: `❌ Erro ao salvar: ${error}`, type: 'error' })} />
              <UpdateFromSheetsButton dashboardType="dre" onDataLoaded={async (data) => {
                if (data instanceof File) {
                  await carregarDREMensal(data);
                  setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' });
                } else {
                  setDados(data);
                  setToast({ message: '✅ Dados atualizados do Google Sheets!', type: 'success' });
                }
              }} onError={(msg) => setToast({ message: `❌ ${msg}`, type: 'error' })} />
              <ClearDataButton onClear={() => { setDados(null as any); setToast({ message: '🧹 Dados removidos da interface.', type: 'info' }); }} compact />
              <DownloadTemplateButton href={DASHBOARD_TEMPLATE_URLS.dre} />
            </div>
          </div>
          <DataUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            dashboardType="dre"
            onManualUpload={async () => {
              try {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.xls';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try {
                    await carregarDREMensal(file);
                    markUserDataLoaded();
                    markDataSource('manual');
                    setToast({ message: `✅ Arquivo carregado! Clique em "Salvar" para persistir.`, type: 'success' });
                    setShowUploadModal(false);
                  } catch (error: any) {
                    setToast({ message: `❌ ${error?.message || 'Erro ao importar arquivo'}`, type: 'error' });
                  }
                };
                input.click();
              } catch {
                setToast({ message: 'Erro ao abrir seletor de arquivo', type: 'error' });
              }
            }}
            onGoogleSheets={(data) => {
              setDados(data);
              markUserDataLoaded();
              markDataSource('google_sheets');
              setToast({ message: 'Dados do Google Sheets carregados!', type: 'success' });
            }}
          />
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
        {/* Tabs de Visualização */}
        <div className={`flex gap-2 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-1`}>
          {[{ id: 'mensal' as ViewType, label: 'Projetado vs Real', icon: 'calendar_month' },
          { id: 'acumulado' as ViewType, label: 'Acumulado Mensal', icon: 'trending_up' },
          { id: 'comparativo' as ViewType, label: 'Comparativo Regimes', icon: 'compare' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${viewType === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              <span className={viewType === tab.id ? 'text-white' : ''}>{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Filtros e tabelas */}
        <div id="pdf-section-dre-filters">
          <DREFilters />
        </div>
        {/* Renderização condicional das tabelas */}
        <div id="pdf-section-dre-table" style={{ marginTop: '24px' }}>
          {viewType === 'mensal' && <DREMensalTable />}
          {viewType === 'acumulado' && <DREAcumuladoTable />}
          {viewType === 'comparativo' && <DREComparativoTable />}
        </div>
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default DREDashboard;
