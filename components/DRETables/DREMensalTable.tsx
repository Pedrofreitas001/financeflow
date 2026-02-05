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

  if (!dreData || !dreData.regimeCaixa || !dreData.regimeCompetencia) {
    return (
      <div className={`${isDark ? 'bg-[#1f2937] border-[#374151] text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl p-8 text-center`}>
        <span className="material-symbols-outlined text-4xl text-text-muted mb-2">table_chart</span>
        <p className="text-sm">Dados inválidos ou planilha incompleta.<br/>Carregue um arquivo DRE Mensal válido para visualizar.</p>
      </div>
    );
  }

  const renderTabela = (data: DREMensal[], titulo: string) => (
    <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} border rounded-2xl overflow-hidden shadow-lg`}>
      <div className={`${isDark ? 'bg-background-dark border-border-dark' : 'bg-gray-50 border-gray-200'} px-6 py-3 border-b`}>
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-1`}>{titulo}</h3>
        <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-600'}`}>
          Ano {dreData.ano} - {dreData.empresa}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${isDark ? 'bg-background-dark border-border-dark' : 'bg-gray-100 border-gray-200'} border-b`}>
              <th className={`px-5 py-2 text-left text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest sticky left-0 ${isDark ? 'bg-background-dark' : 'bg-gray-100'}`}>Descrição</th>
              <th className={`px-2 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest`}>Proj.</th>
              <th className={`px-2 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest`}>Real</th>
              <th className={`px-2 py-2 text-right text-xs font-bold ${isDark ? 'text-text-muted' : 'text-gray-600'} uppercase tracking-widest`}>Var.</th>
              <th className={`px-3 py-2 text-right text-xs font-bold ${isDark ? 'text-primary' : 'text-emerald-700'} uppercase tracking-widest ${isDark ? 'bg-primary/10' : 'bg-emerald-100'}`}>AV%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((linha, idx) => {
              const isNegativo = linha.real < 0;
              const isVariacaoNegativa = linha.variacao.startsWith('-');

              let rowClass = '';
              let fontWeight = '';
              let textColor = '';

              if (linha.linha.isFinal) {
                rowClass = isDark ? 'bg-primary/15 border-t-2 border-primary' : 'bg-emerald-100 border-t-2 border-emerald-400';
                fontWeight = 'font-bold';
                textColor = isDark ? 'text-white' : 'text-gray-900';
              } else if (linha.linha.isResultado && !linha.linha.isPercentual) {
                rowClass = isDark ? 'bg-gray-800/30' : 'bg-gray-100/50';
                fontWeight = 'font-semibold';
                textColor = isDark ? 'text-white' : 'text-gray-900';
              } else {
                textColor = isDark ? 'text-text-secondary' : 'text-gray-700';
              }

              return (
                <tr
                  key={idx}
                  className={`${rowClass} border-b ${isDark ? 'border-border-dark/20' : 'border-gray-200'} hover:${isDark ? 'bg-gray-800/50' : 'bg-gray-50/80'} transition-colors`}
                >
                  <td className={`px-5 py-2 text-xs ${fontWeight} ${textColor} sticky left-0 z-10 ${rowClass || (isDark ? 'bg-surface-dark' : 'bg-white')}`}>
                    {linha.linha.descricao}
                  </td>
                  <td className={`px-2 py-2 text-xs text-right font-medium tabular-nums whitespace-nowrap ${textColor}`}>
                    {linha.linha.isPercentual ? linha.projetado.toFixed(0) + '%' : formatValor(linha.projetado)}
                  </td>
                  <td className={`px-2 py-2 text-xs text-right font-medium tabular-nums whitespace-nowrap ${isNegativo ? 'text-red-500' : textColor}`}>
                    {linha.linha.isPercentual ? linha.real.toFixed(0) + '%' : formatValor(linha.real)}
                  </td>
                  <td className={`px-2 py-2 text-xs text-right font-bold tabular-nums whitespace-nowrap ${isVariacaoNegativa ? 'text-red-600 font-bold' : (isDark ? 'text-blue-400 font-bold' : 'text-emerald-600 font-bold')}`}>
                    {linha.variacao}
                  </td>
                  <td className={`px-3 py-2 text-xs text-right font-semibold tabular-nums whitespace-nowrap ${isDark ? 'text-text-muted' : 'text-gray-600'} ${isDark ? 'bg-primary/10' : 'bg-emerald-100'}`}>
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
        {dreData.regimeCaixa?.mensal && renderTabela(dreData.regimeCaixa.mensal, 'Regime de Caixa - Mensal')}
        {dreData.regimeCompetencia?.mensal && renderTabela(dreData.regimeCompetencia.mensal, 'Regime de Competência - Mensal')}
      </div>
    );
  }

  // ...existing code...
  const data = regimeSelecionado === 'caixa' ? dreData.regimeCaixa?.mensal : dreData.regimeCompetencia?.mensal;
   const titulo = regimeSelecionado === 'caixa' ? 'Regime de Caixa - Mensal' : 'Regime de Competência - Mensal';
   if (!data || !Array.isArray(data) || data.length === 0) {
     return (
      <div className={`${isDark ? 'bg-[#1f2937] border-[#374151] text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl p-8 text-center`}>
        <span className="material-symbols-outlined text-4xl text-text-muted mb-2">table_chart</span>
        <p className="text-sm">Nenhum dado mensal disponível para o regime selecionado.</p>
      </div>
    );
  }
  return renderTabela(data, titulo);
};

export default DREMensalTable;
