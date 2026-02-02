import React from 'react';
import { useDRE } from '../../context/DREContext';
import { useTheme } from '../../context/ThemeContext';

const formatValor = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const DREComparativoTable: React.FC = () => {
  const { dreData } = useDRE();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!dreData || dreData.regimeCaixa.mensal.length === 0 || dreData.regimeCompetencia.mensal.length === 0) {
    return (
      <div className={`${isDark ? 'bg-[#1f2937] border-[#374151] text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl p-8 text-center`}>
        <span className="material-symbols-outlined text-4xl text-text-muted mb-2">compare</span>
        <p className="text-sm">Carregue os dados de ambos os regimes para comparação</p>
      </div>
    );
  };

  const { regimeCaixa, regimeCompetencia } = dreData;

  return (
    <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} border rounded-2xl overflow-hidden shadow-lg`}>
      <div className={`${isDark ? 'bg-background-dark border-border-dark' : 'bg-gray-50 border-gray-200'} px-6 py-3 border-b`}>
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-1`}>Comparativo entre Regimes</h3>
        <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-600'}`}>
          Regime de Caixa vs Regime de Competência - Ano {dreData.ano}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${isDark ? 'bg-background-dark border-border-dark' : 'bg-gray-100 border-gray-200'} border-b`}>
              <th className={`px-5 py-2 text-left text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest sticky left-0 ${isDark ? 'bg-background-dark' : 'bg-gray-100'}`}>Descrição</th>
              <th className={`px-2 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest bg-blue-500/15`}>Caixa</th>
              <th className={`px-2 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest bg-purple-500/15`}>Compet.</th>
              <th className={`px-2 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest bg-primary/10`}>Dif.</th>
              <th className={`px-3 py-2 text-right text-xs font-bold ${isDark ? 'text-primary' : 'text-primary'} uppercase tracking-widest bg-primary/10`}>%</th>
            </tr>
          </thead>
          <tbody>
            {regimeCaixa.mensal.map((linhaCaixa, idx) => {
              const linhaCompetencia = regimeCompetencia.mensal[idx];
              if (!linhaCompetencia) return null;

              const diferenca = linhaCompetencia.real - linhaCaixa.real;
              const variacaoPerc = linhaCaixa.real !== 0
                ? ((diferenca / Math.abs(linhaCaixa.real)) * 100).toFixed(1) + '%'
                : '-';

              const diferencaSignificativa = Math.abs(diferenca) > Math.abs(linhaCaixa.real) * 0.1; // >10%

              let rowClass = '';
              let fontWeight = '';
              let textColor = '';

              if (linhaCaixa.linha.isFinal) {
                rowClass = isDark ? 'bg-primary/15 border-t-2 border-primary' : 'bg-primary/10 border-t-2 border-primary';
                fontWeight = 'font-bold';
                textColor = isDark ? 'text-white' : 'text-gray-900';
              } else if (linhaCaixa.linha.isResultado && !linhaCaixa.linha.isPercentual) {
                rowClass = isDark ? 'bg-gray-800/30' : 'bg-gray-100/50';
                fontWeight = 'font-semibold';
                textColor = isDark ? 'text-white' : 'text-gray-900';
              } else if (diferencaSignificativa) {
                rowClass = isDark ? 'bg-orange-900/10' : 'bg-orange-50/60';
                textColor = isDark ? 'text-text-secondary' : 'text-gray-700';
              } else {
                textColor = isDark ? 'text-text-secondary' : 'text-gray-700';
              }

              return (
                <tr
                  key={idx}
                  className={`${rowClass} border-b ${isDark ? 'border-border-dark/20' : 'border-gray-200'} hover:${isDark ? 'bg-gray-800/50' : 'bg-gray-50/80'} transition-colors`}
                >
                  <td className={`px-5 py-2 text-xs ${fontWeight} ${textColor} sticky left-0 z-10 ${rowClass || (isDark ? 'bg-surface-dark' : 'bg-white')}`}>
                    {linhaCaixa.linha.descricao}
                  </td>
                  <td className={`px-2 py-2 text-xs text-right font-medium tabular-nums whitespace-nowrap bg-blue-500/8 ${linhaCaixa.real < 0 ? 'text-red-500' : textColor}`}>
                    {linhaCaixa.linha.isPercentual ? linhaCaixa.real.toFixed(0) + '%' : formatValor(linhaCaixa.real)}
                  </td>
                  <td className={`px-2 py-2 text-xs text-right font-medium tabular-nums whitespace-nowrap bg-purple-500/8 ${linhaCompetencia.real < 0 ? 'text-red-500' : textColor}`}>
                    {linhaCompetencia.linha.isPercentual ? linhaCompetencia.real.toFixed(0) + '%' : formatValor(linhaCompetencia.real)}
                  </td>
                  <td className={`px-2 py-2 text-xs text-right font-bold tabular-nums whitespace-nowrap bg-primary/10 ${diferenca < 0 ? 'text-red-600 font-bold' : diferenca > 0 ? 'text-blue-600 font-bold' : textColor}`}>
                    {linhaCaixa.linha.isPercentual ? diferenca.toFixed(0) + '%' : formatValor(diferenca)}
                  </td>
                  <td className={`px-3 py-2 text-xs text-right font-bold tabular-nums whitespace-nowrap ${diferencaSignificativa ? 'text-orange-600 font-bold' : (isDark ? 'text-text-muted' : 'text-gray-600')} bg-primary/10`}>
                    {variacaoPerc}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className={`px-6 py-3 border-t ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-orange-500/40"></div>
            <span className={isDark ? 'text-text-muted' : 'text-gray-700'}>Diferença significativa (&gt;10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-blue-500/40"></div>
            <span className={isDark ? 'text-text-muted' : 'text-gray-700'}>Regime de Caixa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-purple-500/40"></div>
            <span className={isDark ? 'text-text-muted' : 'text-gray-700'}>Regime de Competência</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DREComparativoTable;
