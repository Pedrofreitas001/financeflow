import React from 'react';
import { useDRE } from '../../context/DREContext';
import { useTheme } from '../../context/ThemeContext';

const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const DREFilters: React.FC = () => {
  const {
    anoSelecionado,
    mesSelecionado,
    regimeSelecionado,
    periodoInicio,
    periodoFim,
    setAnoSelecionado,
    setMesSelecionado,
    setRegimeSelecionado,
    setPeriodoInicio,
    setPeriodoFim,
    carregarDREMensal,
    carregarDREAcumulado
  } = useDRE();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
      <div className="flex items-center gap-6 flex-wrap">
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-base`}>Filtros DRE</h3>

        {/* Seletor de Ano */}
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>Ano:</label>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg border ${isDark ? 'bg-[#1f2937] border-[#374151] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-primary text-sm`}
          >
            {[2024, 2025, 2026].map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        {/* Seletor de Mês */}
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>Mês:</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg border ${isDark ? 'bg-[#1f2937] border-[#374151] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-primary text-sm min-w-[130px]`}
          >
            {mesesNomes.map((nome, idx) => (
              <option key={idx} value={idx + 1}>{nome}</option>
            ))}
          </select>
        </div>

        {/* Seletor de Período */}
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>Período:</label>
          <select
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg border ${isDark ? 'bg-[#1f2937] border-[#374151] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-primary text-sm`}
          >
            {mesesNomes.map((nome, idx) => (
              <option key={idx} value={idx + 1}>{nome.slice(0, 3)}</option>
            ))}
          </select>
          <span className={`${isDark ? 'text-[#9ca3af]' : 'text-gray-500'} text-sm`}>até</span>
          <select
            value={periodoFim}
            onChange={(e) => setPeriodoFim(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg border ${isDark ? 'bg-[#1f2937] border-[#374151] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-primary text-sm`}
          >
            {mesesNomes.map((nome, idx) => (
              <option key={idx} value={idx + 1}>{nome.slice(0, 3)}</option>
            ))}
          </select>
        </div>

        {/* Toggle Regime */}
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>Regime:</label>
          <div className="flex gap-4">
            {['caixa', 'competencia', 'ambos'].map((regime) => (
              <label key={regime} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="regime"
                  value={regime}
                  checked={regimeSelecionado === regime}
                  onChange={(e) => setRegimeSelecionado(e.target.value as any)}
                  className="mr-1.5 text-primary focus:ring-primary"
                />
                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'} capitalize`}>
                  {regime === 'ambos' ? 'Comparativo' : regime}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DREFilters;
