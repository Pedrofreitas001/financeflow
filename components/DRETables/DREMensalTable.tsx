import React from 'react';
import { useDRE } from '../../context/DREContext';
import { useTheme } from '../../context/ThemeContext';
import { DREMensal } from '../../types';

const formatValor = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const DREMensalTable: React.FC = () => {
  const { dreData, regimeSelecionado } = useDRE();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!dreData) {
    return (
      <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445] text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl p-8 text-center`}>
        <span className="material-symbols-outlined text-4xl text-text-muted mb-2">table_chart</span>
        <p className="text-sm">Carregue um arquivo DRE Mensal para visualizar</p>
      </div>
    );
  }

  const renderTabela = (data: DREMensal[], titulo: string) => (
    <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445]' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}>
      <div className={`${isDark ? 'bg-[#111814]' : 'bg-gray-50'} px-6 py-4 border-b ${isDark ? 'border-[#3b5445]' : 'border-gray-200'}`}>
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>{titulo}</h3>
        <p className={`text-xs ${isDark ? 'text-[#9db9a8]' : 'text-gray-500'} mt-1`}>
          Ano {dreData.ano} - {dreData.empresa}
        </p>
      </div>

      <div>
        <table className="w-full">
          <thead>
            <tr className={`${isDark ? 'bg-[#111814]' : 'bg-gray-100'} border-b ${isDark ? 'border-[#3b5445]' : 'border-gray-200'}`}>
              <th className={`px-6 py-3 text-left text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>Descrição</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>Projetado</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>Real</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>Variação</th>
              <th className={`px-6 py-3 text-right text-xs font-bold ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} uppercase tracking-wider`}>AV%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((linha, idx) => {
              const isNegativo = linha.real < 0;
              const isVariacaoNegativa = linha.variacao.startsWith('-');

              let rowClass = '';
              if (linha.linha.isFinal) {
                rowClass = isDark ? 'bg-[#0d1410] border-t-2 border-primary' : 'bg-yellow-50 border-t-2 border-primary';
              } else if (linha.linha.isResultado && !linha.linha.isPercentual) {
                rowClass = isDark ? 'bg-[#141d18]' : 'bg-gray-50';
              }

              return (
                <tr
                  key={idx}
                  className={`${rowClass} border-b ${isDark ? 'border-[#3b5445]/30' : 'border-gray-100'} hover:${isDark ? 'bg-[#1a2821]' : 'bg-gray-50'} transition-colors`}
                >
                  <td className={`px-6 py-4 text-sm ${linha.linha.isResultado || linha.linha.isPercentual ? 'font-bold' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {linha.linha.descricao}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {linha.linha.isPercentual ? linha.projetado.toFixed(0) + '%' : formatValor(linha.projetado)}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-medium tabular-nums ${isNegativo ? 'text-red-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                    {linha.linha.isPercentual ? linha.real.toFixed(0) + '%' : formatValor(linha.real)}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-bold tabular-nums ${isVariacaoNegativa ? 'text-red-500' : 'text-green-500'}`}>
                    {linha.variacao}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right tabular-nums ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'}`}>
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

  if (regimeSelecionado === 'ambos') {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {renderTabela(dreData.regimeCaixa.mensal, 'Regime de Caixa - Mensal')}
        {renderTabela(dreData.regimeCompetencia.mensal, 'Regime de Competência - Mensal')}
      </div>
    );
  }

  const data = regimeSelecionado === 'caixa' ? dreData.regimeCaixa.mensal : dreData.regimeCompetencia.mensal;
  const titulo = regimeSelecionado === 'caixa' ? 'Regime de Caixa - Mensal' : 'Regime de Competência - Mensal';

  return renderTabela(data, titulo);
};

export default DREMensalTable;
