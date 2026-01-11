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
      <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445] text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl p-8 text-center`}>
        <span className="material-symbols-outlined text-4xl text-text-muted mb-2">compare</span>
        <p className="text-sm">Carregue os dados de ambos os regimes para comparação</p>
      </div>
    );
  };

  const { regimeCaixa, regimeCompetencia } = dreData;

  return (
    <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445]' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}>
      <div className={`${isDark ? 'bg-[#111814]' : 'bg-gray-50'} px-6 py-4 border-b ${isDark ? 'border-[#3b5445]' : 'border-gray-200'}`}>
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>Comparativo entre Regimes</h3>
        <p className={`text-xs ${isDark ? 'text-[#9db9a8]' : 'text-gray-500'} mt-1`}>
          Regime de Caixa vs Regime de Competência - Ano {dreData.ano}
        </p>
      </div>

      <div>
        <table className="w-full">
          <thead>
            <tr className={`${isDark ? 'bg-[#111814]' : 'bg-gray-100'} border-b ${isDark ? 'border-[#3b5445]' : 'border-gray-200'}`}>
              <th className={`px-6 py-3 text-left text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>Descrição</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider bg-blue-500/10`}>Caixa (Real)</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider bg-purple-500/10`}>Competência (Real)</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>Diferença</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>Var %</th>
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
              if (linhaCaixa.linha.isFinal) {
                rowClass = isDark ? 'bg-[#0d1410] border-t-2 border-primary' : 'bg-yellow-50 border-t-2 border-primary';
              } else if (linhaCaixa.linha.isResultado && !linhaCaixa.linha.isPercentual) {
                rowClass = isDark ? 'bg-[#141d18]' : 'bg-gray-50';
              } else if (diferencaSignificativa) {
                rowClass = isDark ? 'bg-orange-900/10' : 'bg-orange-50';
              }

              return (
                <tr
                  key={idx}
                  className={`${rowClass} border-b ${isDark ? 'border-[#3b5445]/30' : 'border-gray-100'} hover:${isDark ? 'bg-[#1a2821]' : 'bg-gray-50'} transition-colors`}
                >
                  <td className={`px-6 py-4 text-sm ${linhaCaixa.linha.isResultado || linhaCaixa.linha.isPercentual ? 'font-bold' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {linhaCaixa.linha.descricao}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-medium tabular-nums bg-blue-500/5 ${linhaCaixa.real < 0 ? 'text-red-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                    {linhaCaixa.linha.isPercentual ? linhaCaixa.real.toFixed(0) + '%' : formatValor(linhaCaixa.real)}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-medium tabular-nums bg-purple-500/5 ${linhaCompetencia.real < 0 ? 'text-red-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                    {linhaCompetencia.linha.isPercentual ? linhaCompetencia.real.toFixed(0) + '%' : formatValor(linhaCompetencia.real)}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-bold tabular-nums ${diferenca < 0 ? 'text-red-500' : diferenca > 0 ? 'text-green-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                    {linhaCaixa.linha.isPercentual ? diferenca.toFixed(0) + '%' : formatValor(diferenca)}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-bold tabular-nums ${diferencaSignificativa ? 'text-orange-500' : (isDark ? 'text-[#9db9a8]' : 'text-gray-600')}`}>
                    {variacaoPerc}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className={`px-6 py-4 border-t ${isDark ? 'border-[#3b5445] bg-[#111814]' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500/30"></div>
            <span className={isDark ? 'text-[#9db9a8]' : 'text-gray-600'}>Diferença significativa (&gt;10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/30"></div>
            <span className={isDark ? 'text-[#9db9a8]' : 'text-gray-600'}>Regime de Caixa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500/30"></div>
            <span className={isDark ? 'text-[#9db9a8]' : 'text-gray-600'}>Regime de Competência</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DREComparativoTable;
