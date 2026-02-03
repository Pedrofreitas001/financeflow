
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarVisible: boolean;
  examplesLoaded?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarVisible, examplesLoaded = false }) => {
  const { theme } = useTheme();
  const { uploadDate } = useFinance();
  const isDark = theme === 'dark';

  return (
    <header className={`h-20 flex-shrink-0 px-8 flex items-center justify-between ${isDark ? 'bg-background-dark/80 border-border-dark' : 'bg-gray-100/80 border-gray-200'} border-b backdrop-blur-md z-10`}>
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-100'}`}
          title="Voltar para Home"
        >
          ← Home
        </Link>
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg ${isDark ? 'hover:bg-surface-dark text-text-muted hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'} transition-colors`}
          title={sidebarVisible ? 'Esconder sidebar' : 'Mostrar sidebar'}
        >
          <span className="material-symbols-outlined">{sidebarVisible ? 'menu_open' : 'menu'}</span>
        </button>
        <div className="flex flex-col justify-center">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>Relatório financeiro consolidado</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm ${isDark ? 'text-text-muted' : 'text-gray-600'}`}>Visão Geral</span>
            {examplesLoaded && (
              <>
                <span className={`h-1 w-1 rounded-full ${isDark ? 'bg-text-muted' : 'bg-gray-400'}`}></span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full">
                  Dados de Exemplo
                </span>
              </>
            )}
            {uploadDate && (
              <>
                <span className={`h-1 w-1 rounded-full ${isDark ? 'bg-text-muted' : 'bg-gray-400'}`}></span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs text-primary font-medium">Última Atualização: {uploadDate}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <input
            className={`${isDark ? 'bg-surface-dark border-border-dark text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all`}
            placeholder="Buscar..."
            type="text"
          />
          <span className={`material-symbols-outlined absolute left-3 top-2.5 ${isDark ? 'text-text-muted' : 'text-gray-400'} text-[20px]`}>search</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
