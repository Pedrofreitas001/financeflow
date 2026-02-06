import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { pdfTabConfigs, PdfSection } from '../utils/pdfExportConfig';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onExport: (selectedSections: string[]) => void;
  isExporting: boolean;
}

const PDFExportModal: React.FC<PDFExportModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  onExport,
  isExporting,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const config = pdfTabConfigs[currentPage];
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (config) {
      const defaults: Record<string, boolean> = {};
      config.sections.forEach(s => {
        defaults[s.id] = s.defaultSelected;
      });
      setSelected(defaults);
    }
  }, [currentPage, isOpen]);

  if (!isOpen || !config) return null;

  const toggleSection = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    config.sections.forEach(s => { all[s.id] = true; });
    setSelected(all);
  };

  const deselectAll = () => {
    const none: Record<string, boolean> = {};
    config.sections.forEach(s => { none[s.id] = false; });
    setSelected(none);
  };

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
  const allSelected = config.sections.every(s => selected[s.id]);
  const noneSelected = config.sections.every(s => !selected[s.id]);

  const handleExport = () => {
    if (selectedIds.length === 0) return;
    onExport(selectedIds);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative z-10 w-full max-w-lg mx-4 rounded-2xl border shadow-2xl ${
        isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 text-xl">picture_as_pdf</span>
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Exportar PDF
                </h2>
                <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
                  {config.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Selecione as seções para incluir:
            </p>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={allSelected}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  allSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'text-blue-500 hover:bg-blue-500/10'
                }`}
              >
                Todas
              </button>
              <button
                onClick={deselectAll}
                disabled={noneSelected}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  noneSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'text-blue-500 hover:bg-blue-500/10'
                }`}
              >
                Nenhuma
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
            {config.sections.map((section) => (
              <label
                key={section.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selected[section.id]
                    ? isDark
                      ? 'bg-blue-600/10 border-blue-500/40'
                      : 'bg-blue-50 border-blue-300'
                    : isDark
                      ? 'bg-transparent border-border-dark hover:border-gray-600'
                      : 'bg-transparent border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                  selected[section.id]
                    ? 'bg-blue-600 border-blue-600'
                    : isDark
                      ? 'border-gray-600'
                      : 'border-gray-300'
                }`}>
                  {selected[section.id] && (
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {section.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-border-dark' : 'border-gray-200'} flex items-center justify-between`}>
          <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
            {selectedIds.length} de {config.sections.length} seções selecionadas
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'text-gray-300 hover:bg-white/10'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={noneSelected || isExporting}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                noneSelected || isExporting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              {isExporting ? 'Gerando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFExportModal;
