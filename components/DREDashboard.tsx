import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDRE } from '../context/DREContext';
import DREFilters from './DRETables/DREFilters';
import DREMensalTable from './DRETables/DREMensalTable';
import DREAcumuladoTable from './DRETables/DREAcumuladoTable';
import DREComparativoTable from './DRETables/DREComparativoTable';

type ViewType = 'mensal' | 'acumulado' | 'comparativo';

const DREDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { dreData, loading, error } = useDRE();
  const isDark = theme === 'dark';
  const [viewType, setViewType] = useState<ViewType>('mensal');

  // Se não houver dados, mostrar disclaimer
  if (!dreData || (dreData && Object.keys(dreData).length === 0)) {
    return (
      <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className={`w-24 h-24 rounded-full ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-gray-200 border-gray-300'} border flex items-center justify-center mx-auto mb-6`}>
              <span className={`material-symbols-outlined text-5xl ${isDark ? 'text-primary' : 'text-primary'}`}>table_chart</span>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Nenhum dado carregado</h2>
            <p className={`mb-8 ${isDark ? 'text-text-muted' : 'text-gray-600'}`}>
              Carregue um arquivo Excel com as 4 abas DRE na barra lateral
            </p>

            {/* Formato Esperado */}
            <div className={`rounded-xl border p-6 w-full max-w-2xl ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className={`material-symbols-outlined ${isDark ? 'text-primary' : 'text-primary'}`}>description</span>
                Formato Esperado: DRE com 4 Abas
              </h3>
              <div className={`rounded-lg p-4 mb-4 overflow-x-auto ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                <table className={`text-xs w-full ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <thead>
                    <tr className={`border-b ${isDark ? 'text-text-muted border-border-dark' : 'text-gray-600 border-gray-200'}`}>
                      <th className="text-left py-2">Aba</th>
                      <th className="text-left py-2">Descrição</th>
                      <th className="text-left py-2">Colunas Principais</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${isDark ? 'border-border-dark/50' : 'border-gray-200/50'}`}>
                      <td className={`py-2 font-mono ${isDark ? 'text-primary' : 'text-primary'}`}>DRE Mensal</td>
                      <td>Projetado vs Real</td>
                      <td>Receita, Custo, EBITDA, Lucro</td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-border-dark/50' : 'border-gray-200/50'}`}>
                      <td className={`py-2 font-mono ${isDark ? 'text-primary' : 'text-primary'}`}>DRE Acumulado</td>
                      <td>Acumulado Mensal</td>
                      <td>Receita, Custo, EBITDA, Lucro</td>
                    </tr>
                    <tr className={`border-b ${isDark ? 'border-border-dark/50' : 'border-gray-200/50'}`}>
                      <td className={`py-2 font-mono ${isDark ? 'text-primary' : 'text-primary'}`}>DRE Comparativo</td>
                      <td>Regimes Diferentes</td>
                      <td>Receita, Custo, EBITDA, Lucro</td>
                    </tr>
                    <tr>
                      <td className={`py-2 font-mono ${isDark ? 'text-primary' : 'text-primary'}`}>Indicadores</td>
                      <td>Métricas Financeiras</td>
                      <td>Margem, ROE, Índices</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-600'}`}>Cada aba deve conter os dados mensais estruturados para análise detalhada</p>

              {/* Botões Google Sheets */}
              <div className="mt-6 flex gap-3">
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Visualizar Modelo
                </a>
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                  <span className="material-symbols-outlined text-base">download</span>
                  Baixar Arquivo
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
      <div className="max-w-[1600px] mx-auto">
        {/* Filtros Horizontais */}
        <div className="mb-6">
          <DREFilters />

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Tabelas DRE
          </h1>
          <p className={`text-sm ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'}`}>
            Demonstração do Resultado do Exercício - Análise Detalhada
          </p>
        </div>

        {/* Tabs de Visualização */}
        <div className={`flex gap-2 mb-6 ${isDark ? 'bg-[#1c2720] border-[#3b5445]' : 'bg-white border-gray-200'} border rounded-lg p-1`}>
          {[
            { id: 'mensal' as ViewType, label: 'Projetado vs Real', icon: 'calendar_month' },
            { id: 'acumulado' as ViewType, label: 'Acumulado Mensal', icon: 'trending_up' },
            { id: 'comparativo' as ViewType, label: 'Comparativo Regimes', icon: 'compare' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${viewType === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : isDark
                  ? 'text-[#9db9a8] hover:text-white hover:bg-[#111814]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`${isDark ? 'bg-[#1c2720] border-[#3b5445]' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center`}>
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className={`mt-4 text-sm ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'}`}>Processando arquivo...</p>
          </div>
        )}

        {/* Tabelas */}
        {!loading && (
          <div className="space-y-6">
            {viewType === 'mensal' && <DREMensalTable />}
            {viewType === 'acumulado' && <DREAcumuladoTable />}
            {viewType === 'comparativo' && <DREComparativoTable />}
          </div>
        )}

        {/* Informações de Rodapé */}
        {dreData && !loading && (
          <div className={`mt-6 ${isDark ? 'bg-[#1c2720] border-[#3b5445]' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <div className="flex-1">
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Informações sobre as Tabelas</h4>
                <ul className={`text-xs ${isDark ? 'text-[#9db9a8]' : 'text-gray-600'} space-y-1`}>
                  <li>• <span className="font-medium">Valores negativos</span> são exibidos em vermelho</li>
                  <li>• <span className="font-medium">Linhas de resultado (=)</span> aparecem em negrito com fundo destacado</li>
                  <li>• <span className="font-medium">EBITDA e Lucro/Prejuízo</span> são destacados com borda verde</li>
                  <li>• <span className="font-medium">Análise Vertical (AV%)</span> mostra a participação sobre a Receita Líquida</li>
                  <li>• No comparativo, diferenças <span className="font-medium">superiores a 10%</span> são destacadas em laranja</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default DREDashboard;
