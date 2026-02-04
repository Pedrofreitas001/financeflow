import React, { useState } from 'react';
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
import ReportCover from './components/ReportCover.tsx';
import AIChat from './components/AIChat.tsx';
import { FinanceProvider, useFinance } from './context/FinanceContext.tsx';
import { DespesasProvider, useDespesas } from './context/DespesasContext.tsx';
import { DREProvider } from './context/DREContext.tsx';
import { CashFlowProvider } from './context/CashFlowContext/CashFlowContext.tsx';
import { IndicadoresProvider } from './context/IndicadoresContext/IndicadoresContext.tsx';
import { OrcamentoProvider } from './context/OrcamentoContext/OrcamentoContext.tsx';
import { BalanceteProvider } from './context/BalanceteContext.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { useUserPlan } from './hooks/useUserPlan.ts';
import { useExampleData } from './utils/useExampleData.ts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type PageType = 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete' | 'settings' | 'ai-insights';

const AppContent: React.FC = () => {
  const { filtros, kpis } = useFinance();
  const { filtrosDespesas } = useDespesas();
  const { theme } = useTheme();
  const { isLoadingExamples, examplesLoaded } = useExampleData();
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<{ feature: string; description: string }>({
    feature: '',
    description: ''
  });
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const { userPlan } = useUserPlan(user?.id);

  // Diamond e Premium têm acesso a exportação de PDF
  const hasExportAccess = userPlan.isDiamond || userPlan.isPremium;

  const handleExportPDF = async () => {
    // Verificar se tem acesso (Premium ou Diamond)
    if (!hasExportAccess) {
      setPremiumFeature({
        feature: 'Exportação de PDF',
        description: 'Exporte relatórios profissionais em PDF com todos os gráficos e análises do seu dashboard.'
      });
      setShowPremiumModal(true);
      return;
    }

    setIsExporting(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const innerWidth = pageWidth - (margin * 2);

    // Cores baseadas no tema
    const bgColor = isDark ? '#111827' : '#f5f5f5';
    const fillColorRGB = isDark ? [17, 24, 39] : [245, 245, 245];

    try {
      const coverElement = document.getElementById('pdf-cover');
      if (coverElement) {
        const coverCanvas = await html2canvas(coverElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: bgColor,
          logging: false
        });
        const coverImg = coverCanvas.toDataURL('image/png');
        pdf.addImage(coverImg, 'PNG', 0, 0, pageWidth, pageHeight);
      }

      const sections = [
        'pdf-section-kpis',
        'pdf-section-middle',
        'pdf-section-waterfall',
        'pdf-section-bottom',
        'pdf-section-expense-evolution'
      ];

      pdf.addPage();
      pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      let currentY = margin;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: bgColor,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * innerWidth) / imgProps.width;

        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, innerWidth, imgHeight);
        currentY += imgHeight + 6;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `FinanceFlow_Report_${filtros.empresa === 'Todas' ? 'Global' : filtros.empresa}_${timestamp}.pdf`;
      pdf.save(fileName);
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
        onExport={handleExportPDF}
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
