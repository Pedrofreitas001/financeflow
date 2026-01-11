import React from 'react';
import { useDRE } from '../../context/DREContext';
import { useTheme } from '../../context/ThemeContext';
import { DREAcumulado } from '../../types';

const formatValor = (valor: number): string => {
  if (Math.abs(valor) >= 1000000) {
    return (valor / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(valor) >= 1000) {
    return (valor / 1000).toFixed(0) + 'k';
  }
  return valor.toFixed(0);
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
      <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445]' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}>
        <div className={`${isDark ? 'bg-[#111814]' : 'bg-gray-50'} px-6 py-4 border-b ${isDark ? 'border-[#3b5445]' : 'border-gray-200'}`}>
          <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>{titulo}</h3>
          <p className={`text-xs ${isDark ? 'text-[#9db9a8]' : 'text-gray-500'} mt-1`}>
            Ano {dreData.ano} - Período: {mesesAbrev[periodoInicio - 1]} a {mesesAbrev[periodoFim - 1]}
          </p>
        </div>

        <div>
          <table className="w-full text-xs">
            <thead>
              <tr className={`${isDark ? 'bg-[#111814]' : 'bg-gray-100'} border-b ${isDark ? 'border-[#3b5445]' : 'border-gray-200'}`}>
                <th className={`px-4 py-3 text-left text-[10px] font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider sticky left-0 ${isDark ? 'bg-[#111814]' : 'bg-gray-100'}`}>
                  Descrição
                </th>
                {mesesFiltrados.map((mes) => (
                  <th key={mes} className={`px-3 py-3 text-right text-[10px] font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider whitespace-nowrap`}>
                    {mes}
                  </th>
                ))}
                <th className={`px-4 py-3 text-right text-[10px] font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider bg-primary/10`}>
                  TOTAL
                </th>
                <th className={`px-4 py-3 text-right text-[10px] font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>
                  AV%
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((linha, idx) => {
                let rowClass = '';
                if (linha.linha.isFinal) {
                  rowClass = isDark ? 'bg-[#0d1410] border-t-2 border-primary' : 'bg-yellow-50 border-t-2 border-primary';
                } else if (linha.linha.isResultado && !linha.linha.isPercentual) {
                  rowClass = isDark ? 'bg-[#141d18]' : 'bg-gray-50';
                }

                const mesesValores = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;
                const valoresFiltrados = mesesValores.slice(periodoInicio - 1, periodoFim);

                return (
                  <tr
                    key={idx}
                    className={`${rowClass} border-b ${isDark ? 'border-[#3b5445]/30' : 'border-gray-100'} hover:${isDark ? 'bg-[#1a2821]' : 'bg-gray-50'} transition-colors`}
                  >
                    <td className={`px-4 py-3 text-xs ${linha.linha.isResultado || linha.linha.isPercentual ? 'font-bold' : ''} ${isDark ? 'text-white' : 'text-gray-900'} sticky left-0 ${rowClass || (isDark ? 'bg-[#1c2720]' : 'bg-white')}`}>
                      {linha.linha.descricao}
                    </td>
                    {valoresFiltrados.map((mes) => {
                      const valor = linha.valores[mes];
                      const isNegativo = valor < 0;

                      return (
                        <td
                          key={mes}
                          className={`px-3 py-3 text-xs text-right tabular-nums whitespace-nowrap ${isNegativo ? 'text-red-500 font-medium' : (isDark ? 'text-white' : 'text-gray-900')}`}
                        >
                          {linha.linha.isPercentual ? valor.toFixed(0) + '%' : formatValor(valor)}
                        </td>
                      );
                    })}
                    <td className={`px-4 py-3 text-xs text-right font-bold tabular-nums whitespace-nowrap ${linha.valores.total < 0 ? 'text-red-500' : (isDark ? 'text-white' : 'text-gray-900')} bg-primary/5`}>
                      {linha.linha.isPercentual ? linha.valores.total.toFixed(0) + '%' : formatValor(linha.valores.total)}
                    </td>
                    <td className={`px-4 py-3 text-xs text-right tabular-nums ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'}`}>
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
