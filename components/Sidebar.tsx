
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useDespesas } from '../context/DespesasContext';
import { useTheme } from '../context/ThemeContext';
import * as XLSX from 'xlsx';

interface SidebarProps {
  onExport?: () => void;
  visible?: boolean;
  currentPage?: 'dashboard' | 'despesas';
  onNavigate?: (page: 'dashboard' | 'despesas') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onExport, visible = true, currentPage = 'dashboard', onNavigate }) => {
  const { empresas, mesesDisponiveis, filtros, setFiltroEmpresa, setFiltroMeses, carregarDados } = useFinance();
  const {
    empresasDespesas,
    mesesDisponiveisDespesas,
    filtrosDespesas,
    setFiltroDespesasEmpresa,
    setFiltroDespesasMeses,
    carregarDadosDespesas
  } = useDespesas();
  const { theme, toggleTheme } = useTheme();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      carregarDados(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUploadDespesas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      carregarDadosDespesas(data);
    };
    reader.readAsBinaryString(file);
  };

  const toggleMonth = (month: string) => {
    if (currentPage === 'dashboard') {
      const current = filtros.meses;
      if (current.includes(month)) {
        setFiltroMeses(current.filter(m => m !== month));
      } else {
        setFiltroMeses([...current, month]);
      }
    } else {
      const current = filtrosDespesas.meses;
      if (current.includes(month)) {
        setFiltroDespesasMeses(current.filter(m => m !== month));
      } else {
        setFiltroDespesasMeses([...current, month]);
      }
    }
  };

  return (
    <aside className={`w-80 flex-shrink-0 flex flex-col border-r border-border-dark bg-background-dark h-screen overflow-hidden transition-all duration-300 ${visible ? 'ml-0' : '-ml-80'}`}>
      <div className="p-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-[#054d22] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">bar_chart</span>
          </div>
          <div>
            <p className="text-white text-lg font-bold leading-tight">FinanceFlow</p>
            <p className="text-text-muted text-xs">V3 WebApp</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-8">
        <nav className="flex flex-col gap-2">
          <p className="px-2 text-xs font-bold text-text-muted uppercase">Navegação</p>
          <button
            onClick={() => onNavigate?.('dashboard')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'dashboard'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'dashboard' ? 'text-primary' : ''}`}>
              dashboard
            </span>
            <p className="text-sm font-medium">Dashboard Financeiro</p>
          </button>
          <button
            onClick={() => onNavigate?.('despesas')}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${currentPage === 'despesas'
              ? 'bg-surface-dark border-primary text-white'
              : 'bg-transparent border-border-dark text-text-muted hover:border-primary/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentPage === 'despesas' ? 'text-primary' : ''}`}>
              account_balance_wallet
            </span>
            <p className="text-sm font-medium">Análise de Despesas</p>
          </button>
        </nav>

        <div className="flex flex-col gap-2">
          <p className="px-2 text-xs font-bold text-text-muted uppercase">Aparência</p>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between rounded-xl bg-surface-dark border border-border-dark p-3 hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
              <p className="text-white text-sm font-medium">{theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'}</p>
            </div>
            <span className="material-symbols-outlined text-text-muted text-lg group-hover:text-primary transition-colors">toggle_{theme === 'dark' ? 'off' : 'on'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <p className="px-2 text-xs font-bold text-text-muted uppercase">Filtros Globais</p>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-muted px-2">Empresa</label>
            <select
              value={currentPage === 'dashboard' ? filtros.empresa : filtrosDespesas.empresa}
              onChange={(e) => {
                if (currentPage === 'dashboard') {
                  setFiltroEmpresa(e.target.value);
                } else {
                  setFiltroDespesasEmpresa(e.target.value);
                }
              }}
              className="w-full rounded-xl bg-surface-dark border border-border-dark text-white p-3 text-sm focus:ring-primary"
            >
              {(currentPage === 'dashboard' ? empresas : empresasDespesas).map(emp => <option key={emp} value={emp}>{emp}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-muted px-2">Período</label>
            <div className="flex flex-wrap gap-2">
              {(currentPage === 'dashboard' ? mesesDisponiveis : mesesDisponiveisDespesas).map(month => (
                <button
                  key={month}
                  onClick={() => toggleMonth(month)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${(currentPage === 'dashboard' ? filtros.meses : filtrosDespesas.meses).includes(month)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-dark text-text-muted border-border-dark'
                    }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>

        {currentPage === 'dashboard' ? (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-primary mb-2">cloud_upload</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors">Carregar Excel Financeiro</p>
          </div>
        ) : (
          <div className="relative border border-dashed border-border-dark rounded-xl p-6 flex flex-col items-center justify-center bg-surface-dark/50 hover:bg-surface-dark transition-colors cursor-pointer group">
            <input type="file" onChange={handleFileUploadDespesas} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls" />
            <span className="material-symbols-outlined text-border-dark group-hover:text-primary mb-2">cloud_upload</span>
            <p className="text-xs text-center text-text-muted group-hover:text-white transition-colors">Carregar Excel de Despesas</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border-dark">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#0ca348] text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
        >
          <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">picture_as_pdf</span>
          <span>Exportar Relatório</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
