import React from 'react';
import { useDRE } from '../../context/DREContext';
import { useTheme } from '../../context/ThemeContext';
import { DREAcumulado } from '../../types';

const formatValor = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const mesesAbrev = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const DREAcumuladoTable: React.FC = () => {
  const { dreData, regimeSelecionado, periodoInicio, periodoFim } = useDRE();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!dreData || dreData.regimeCaixa.acumulado.length === 0) {
    return (
      <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445] text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl p-8 text-center`}>
        <span className="material-symbols-outlined text-4xl text-text-muted mb-2">table_chart</span>
        <p className="text-sm">Carregue um arquivo DRE Acumulado para visualizar</p>
      </div>
    );
  }

  const renderTabela = (data: DREAcumulado[], titulo: string) => {
    const mesesFiltrados = mesesAbrev.slice(periodoInicio - 1, periodoFim);

    return (
      <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} border rounded-2xl overflow-hidden shadow-lg`}>
        <div className={`${isDark ? 'bg-background-dark border-border-dark' : 'bg-gray-50 border-gray-200'} px-6 py-3 border-b`}>
          <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-1`}>{titulo}</h3>
          <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-600'}`}>
            Ano {dreData.ano} — Período: {mesesAbrev[periodoInicio - 1]} a {mesesAbrev[periodoFim - 1]}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDark ? 'bg-background-dark border-border-dark' : 'bg-gray-100 border-gray-200'} border-b`}>
                <th className={`px-5 py-2 text-left text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest sticky left-0 z-20 ${isDark ? 'bg-background-dark' : 'bg-gray-100'} border-r ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                  Descrição
                </th>
                {mesesFiltrados.map((mes) => (
                  <th key={mes} className={`px-1.5 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest whitespace-nowrap`}>
                    {mes}
                  </th>
                ))}
                <th className={`px-3 py-2 text-right text-xs font-bold ${isDark ? 'text-primary' : 'text-primary'} uppercase tracking-widest bg-primary/10 border-l ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                  TOTAL
                </th>
                <th className={`px-3 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest`}>
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((linha, idx) => {
                let rowClass = '';
                let fontWeight = '';
                let textColor = '';

                if (linha.linha.isFinal) {
                  rowClass = isDark ? 'bg-primary/15 border-t-2 border-primary' : 'bg-primary/10 border-t-2 border-primary';
                  fontWeight = 'font-bold';
                  textColor = isDark ? 'text-white' : 'text-gray-900';
                } else if (linha.linha.isResultado && !linha.linha.isPercentual) {
                  rowClass = isDark ? 'bg-gray-800/30' : 'bg-gray-100/50';
                  fontWeight = 'font-semibold';
                  textColor = isDark ? 'text-white' : 'text-gray-900';
                } else {
                  textColor = isDark ? 'text-text-secondary' : 'text-gray-700';
                }

                const mesesValores = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;
                const valoresFiltrados = mesesValores.slice(periodoInicio - 1, periodoFim);

                return (
                  <tr
                    key={idx}
                    className={`${rowClass} border-b ${isDark ? 'border-border-dark/20' : 'border-gray-200'} hover:${isDark ? 'bg-gray-800/50' : 'bg-gray-50/80'} transition-colors`}
                  >
                    <td className={`px-5 py-2 text-xs ${fontWeight} ${textColor} sticky left-0 z-50 border-r ${isDark ? 'border-border-dark' : 'border-gray-200'} ${linha.linha.isFinal ? (isDark ? 'bg-primary/15' : 'bg-primary/10') :
                      linha.linha.isResultado && !linha.linha.isPercentual ? (isDark ? 'bg-gray-800/30' : 'bg-gray-100/50') :
                        (isDark ? 'bg-surface-dark' : 'bg-white')
                      }`}>
                      {linha.linha.descricao}
                    </td>
                    {valoresFiltrados.map((mes) => {
                      const valor = linha.valores[mes];
                      const isNegativo = valor < 0;

                      return (
                        <td
                          key={mes}
                          className={`px-1.5 py-2 text-xs text-right tabular-nums font-medium whitespace-nowrap ${isNegativo ? 'text-red-500' : textColor}`}
                        >
                          {linha.linha.isPercentual ? valor.toFixed(0) + '%' : formatValor(valor)}
                        </td>
                      );
                    })}
                    <td className={`px-3 py-2 text-xs text-right font-bold tabular-nums whitespace-nowrap ${linha.valores.total < 0 ? 'text-red-600 font-bold' : textColor} bg-primary/10 border-l ${isDark ? 'border-border-dark/20' : 'border-gray-200'}`}>
                      {linha.linha.isPercentual ? linha.valores.total.toFixed(0) + '%' : formatValor(linha.valores.total)}
                    </td>
                    <td className={`px-3 py-2 text-xs text-right tabular-nums font-semibold ${isDark ? 'text-text-muted' : 'text-gray-600'}`}>
                      {linha.analiseVertical}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (regimeSelecionado === 'ambos') {
    return (
      <div className="space-y-6">
        {renderTabela(dreData.regimeCaixa.acumulado, 'Regime de Caixa - Acumulado')}
        {renderTabela(dreData.regimeCompetencia.acumulado, 'Regime de Competência - Acumulado')}
      </div>
    );
  }

  const data = regimeSelecionado === 'caixa' ? dreData.regimeCaixa.acumulado : dreData.regimeCompetencia.acumulado;
  const titulo = regimeSelecionado === 'caixa' ? 'Regime de Caixa - Acumulado' : 'Regime de Competência - Acumulado';

  return renderTabela(data, titulo);
};

export default DREAcumuladoTable;
