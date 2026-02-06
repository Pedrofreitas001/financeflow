import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import DashboardDespesas from './components/DashboardDespesas.tsx';
import DREDashboard from './components/DREDashboard.tsx';
import DashboardCashFlow from './components/CashFlow/DashboardCashFlow.tsx';
import DashboardIndicadores from './components/Indicadores/DashboardIndicadores.tsx';
import DashboardOrcamento from './components/Orcamento/DashboardOrcamento.tsx';
import DashboardBalancete from './components/Balancete/DashboardBalancete.tsx';
import DashboardSettings from './components/Settings/DashboardSettings.tsx';
import DashboardAIInsights from './components/AIInsights/DashboardAIInsights.tsx';
import PremiumModal from './components/PremiumModal.tsx';
import PDFExportModal from './components/PDFExportModal.tsx';
import ReportCover from './components/ReportCover.tsx';
import AIChat from './components/AIChat.tsx';
import { FinanceProvider, useFinance } from './context/FinanceContext.tsx';
import { DespesasProvider, useDespesas } from './context/DespesasContext.tsx';
import { DREProvider, useDRE } from './context/DREContext.tsx';
import { CashFlowProvider, useCashFlow } from './context/CashFlowContext/CashFlowContext.tsx';
import { IndicadoresProvider, useIndicadores } from './context/IndicadoresContext/IndicadoresContext.tsx';
import { OrcamentoProvider, useOrcamento } from './context/OrcamentoContext/OrcamentoContext.tsx';
import { BalanceteProvider, useBalancete } from './context/BalanceteContext.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { useUserPlan } from './hooks/useUserPlan.ts';
import { useExampleData } from './utils/useExampleData.ts';
import { loadSavedDashboard } from './utils/savedDashboardManager.ts';
import { generatePDF } from './utils/pdfExportService.ts';
import { pdfTabConfigs } from './utils/pdfExportConfig.ts';

type PageType = 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete' | 'settings' | 'ai-insights';

const AppContent: React.FC = () => {
  const { filtros, kpis, carregarDados } = useFinance();
  const { filtrosDespesas, carregarDadosDespesas } = useDespesas();
  const { setDados: setDreDados } = useDRE();
  const { setDados: setCashFlowDados } = useCashFlow();
  const { setDados: setIndicadoresDados } = useIndicadores();
  const { setDados: setOrcamentoDados } = useOrcamento();
  const { setDados: setBalanceteDados } = useBalancete();
  const { theme } = useTheme();
  const { isLoadingExamples, examplesLoaded } = useExampleData();
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<{ feature: string; description: string }>({
    feature: '',
    description: ''
  });
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const { userPlan } = useUserPlan(user?.id);

  // Diamond e Premium têm acesso a exportação de PDF
  const hasExportAccess = userPlan.isDiamond || userPlan.isPremium;

  // Aplica dados ao contexto correto com base no tipo de dashboard
  const applyDataToContext = useCallback((dashboardType: string, data: any[]) => {
    if (!data || data.length === 0) return;
    switch (dashboardType) {
      case 'dashboard':
        carregarDados(data);
        break;
      case 'despesas':
        carregarDadosDespesas(data as any);
        break;
      case 'dre':
        setDreDados(data[0] as any);
        break;
      case 'cashflow':
        setCashFlowDados(data as any);
        break;
      case 'indicadores':
        setIndicadoresDados(data as any);
        break;
      case 'orcamento':
        setOrcamentoDados(data as any);
        break;
      case 'balancete':
        setBalanceteDados(data as any);
        break;
    }
  }, [carregarDados, carregarDadosDespesas, setDreDados, setCashFlowDados, setIndicadoresDados, setOrcamentoDados, setBalanceteDados]);

  // Escuta evento de sincronização do Google Sheets (disparado pela aba de histórico)
  // Quando o usuário clica "Atualizar" na aba de histórico, carrega os dados no dashboard correspondente
  useEffect(() => {
    const handleGoogleSheetsSync = async (event: Event) => {
      const customEvent = event as CustomEvent<{ dashboardType: string }>;
      const dashboardType = customEvent.detail?.dashboardType;
      if (!dashboardType || !user?.id) return;

      try {
        const data = await loadSavedDashboard(user.id, dashboardType as any);
        if (data) {
          applyDataToContext(dashboardType, data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados após sync do Google Sheets:', err);
      }
    };

    window.addEventListener('google-sheets-synced', handleGoogleSheetsSync);
    return () => window.removeEventListener('google-sheets-synced', handleGoogleSheetsSync);
  }, [user?.id, applyDataToContext]);

  const handleExportPDFClick = () => {
    // Verificar se tem acesso (Premium ou Diamond)
    if (!hasExportAccess) {
      setPremiumFeature({
        feature: 'Exportação de PDF',
        description: 'Exporte relatórios profissionais em PDF com todos os gráficos e análises do seu dashboard.'
      });
      setShowPremiumModal(true);
      return;
    }

    // Abas sem gráficos exportáveis
    if (currentPage === 'settings' || currentPage === 'ai-insights') {
      return;
    }

    // Verificar se a aba tem configuração de PDF
    if (!pdfTabConfigs[currentPage]) {
      return;
    }

    setShowExportModal(true);
  };

  const handleExportPDF = async (selectedSections: string[]) => {
    setShowExportModal(false);
    setIsExporting(true);

    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const config = pdfTabConfigs[currentPage];
      await generatePDF({
        selectedSections,
        isDark,
        tabTitle: config.title,
        fileName: config.fileName,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o relatório. Por favor, tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-background-dark overflow-hidden">
      <Sidebar
        onExport={handleExportPDFClick}
        visible={sidebarVisible}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} sidebarVisible={sidebarVisible} examplesLoaded={examplesLoaded} />

        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'despesas' && <DashboardDespesas />}
        {currentPage === 'dre' && <DREDashboard />}
        {currentPage === 'cashflow' && <DashboardCashFlow />}
        {currentPage === 'indicadores' && <DashboardIndicadores />}
        {currentPage === 'orcamento' && <DashboardOrcamento />}
        {currentPage === 'balancete' && <DashboardBalancete />}
        {currentPage === 'settings' && <DashboardSettings />}
        {currentPage === 'ai-insights' && <DashboardAIInsights />}

        {/* Hidden Cover Component for Capture */}
        <ReportCover
          empresa={filtros.empresa === 'Todas' ? 'Consolidado FinanceFlow' : filtros.empresa}
          periodo={filtros.meses.length === 0
            ? 'Período Completo'
            : filtros.meses.length === 12
              ? 'Anual Consolidado'
              : filtros.meses.sort((a, b) => a.localeCompare(b)).join(', ')}
          kpis={kpis}
        />

        {/* IA Chat Component */}
        <AIChat />

        {/* PDF Export Modal */}
        <PDFExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          currentPage={currentPage}
          onExport={handleExportPDF}
          isExporting={isExporting}
        />

        {/* Premium Modal */}
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          feature={premiumFeature.feature}
          description={premiumFeature.description}
        />

        {/* Export Loading Overlay */}
        {isExporting && (
          <div className="fixed inset-0 bg-background-dark/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Gerando Relatório de Alta Performance</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold animate-pulse">Otimizando layout e renderizando gráficos...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardApp: React.FC = () => {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <DespesasProvider>
          <DREProvider>
            <CashFlowProvider>
              <IndicadoresProvider>
                <OrcamentoProvider>
                  <BalanceteProvider>
                    <AppContent />
                  </BalanceteProvider>
                </OrcamentoProvider>
              </IndicadoresProvider>
            </CashFlowProvider>
          </DREProvider>
        </DespesasProvider>
      </FinanceProvider>
    </ThemeProvider>
  );
};

export default DashboardApp;
