
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { formatBRL } from '../utils/financeUtils';

interface ReportCoverProps {
  empresa: string;
  periodo: string;
  kpis: any;
}

const ReportCover: React.FC<ReportCoverProps> = ({ empresa, periodo, kpis }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div id="pdf-cover" className={`w-[210mm] h-[297mm] ${isDark ? 'bg-[#111814] text-white' : 'bg-[#f5f5f5] text-gray-900'} p-20 flex flex-col justify-between absolute -left-[9999px] top-0`}>
      <div className="flex flex-col items-center mt-12">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#0ebe54] to-[#054d22] flex items-center justify-center mb-6 shadow-2xl shadow-primary/40">
          <span className="material-symbols-outlined text-white text-5xl">bar_chart</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>FinanceFlow</h1>
        <p className="text-primary text-base font-medium tracking-[0.3em] uppercase opacity-80">Executive Financial Analysis</p>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
        <div className="space-y-4">
          <div className="h-1 w-16 bg-primary mb-8"></div>
          <h2 className={`text-4xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Consolidação de Resultados</h2>
          <p className={`${isDark ? 'text-text-muted' : 'text-gray-600'} text-base leading-relaxed`}>Relatório gerencial detalhado com indicadores de performance, fluxo de caixa e análise estratégica de margens operacionais.</p>

          <div className={`grid grid-cols-2 gap-10 mt-12 pt-12 border-t ${isDark ? 'border-border-dark/50' : 'border-gray-300/50'}`}>
            <div>
              <p className={`${isDark ? 'text-text-muted' : 'text-gray-500'} text-[9px] uppercase font-bold tracking-[0.2em] mb-1`}>Organização</p>
              <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{empresa}</p>
            </div>
            <div>
              <p className={`${isDark ? 'text-text-muted' : 'text-gray-500'} text-[9px] uppercase font-bold tracking-[0.2em] mb-1`}>Competência</p>
              <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{periodo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} border rounded-2xl p-8 mb-8`}>
        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col">
            <p className={`${isDark ? 'text-text-muted' : 'text-gray-500'} text-[9px] uppercase font-bold mb-1.5 tracking-widest`}>Receita Líquida</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tabular-nums`}>{formatBRL(kpis.faturamentoLiquido)}</p>
          </div>
          <div className={`flex flex-col border-l ${isDark ? 'border-border-dark' : 'border-gray-300'} pl-6`}>
            <p className={`${isDark ? 'text-text-muted' : 'text-gray-500'} text-[9px] uppercase font-bold mb-1.5 tracking-widest`}>EBITDA Estimado</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tabular-nums`}>{formatBRL(kpis.resultado)}</p>
          </div>
          <div className={`flex flex-col border-l ${isDark ? 'border-border-dark' : 'border-gray-300'} pl-6`}>
            <p className={`${isDark ? 'text-text-muted' : 'text-gray-500'} text-[9px] uppercase font-bold mb-1.5 tracking-widest`}>Margem Contrib.</p>
            <p className="text-xl font-bold text-primary tabular-nums">{kpis.margemContribuicaoPerc.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className={`flex justify-between items-end ${isDark ? 'text-text-muted' : 'text-gray-600'} text-[10px] border-t ${isDark ? 'border-border-dark' : 'border-gray-300'} pt-6`}>
        <div>
          <p className="font-medium">FinanceFlow Dashboard V3</p>
          <p className="opacity-60">Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="uppercase tracking-[0.2em] font-bold text-primary mb-0.5 text-[9px]">Documento Confidencial</p>
          <p className="opacity-60">Uso Exclusivo da Diretoria Executiva</p>
        </div>
      </div>
    </div>
  );
};

export default ReportCover;
