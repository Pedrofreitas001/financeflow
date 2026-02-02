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
      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-white'}`}>
        <div className={`flex-1 overflow-y-auto custom-scrollbar flex items-center justify-center relative`} style={{
          backgroundColor: '#0f1d32',
          backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59, 130, 246, 0.45) 0%, rgba(37, 99, 235, 0.25) 40%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.35) 0%, transparent 50%), radial-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 100% 100%, 24px 24px'
        }}>
          <div className="max-w-2xl w-full mx-auto px-8">
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <h2 data-cta-header style={{ color: '#ffffff !important', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Nenhum dado carregado
              </h2>
              <p data-cta-text style={{ color: '#d1d5db !important' }}>
                Importe um arquivo Excel com dados da DRE para visualizar
              </p>
            </div>

            {/* Informações do Formato */}
            <div className="rounded-2xl border border-gray-300 shadow-lg p-6 bg-white">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                <span className="material-symbols-outlined text-primary">description</span>
                Formato Esperado: Dashboard_Financeiro_Exemplo.xlsx
              </h3>
              <div className="rounded-lg p-4 mb-4 overflow-x-auto bg-gray-50">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-300">
                      <th className="text-left py-2">Coluna</th>
                      <th className="text-left py-2">Tipo</th>
                      <th className="text-left py-2">Exemplo</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Empresa</td>
                      <td>texto</td>
                      <td>CloudTech Industries, TechSolutions...</td>
                    </tr>
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Ano</td>
                      <td>número</td>
                      <td>2025</td>
                    </tr>
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Mês</td>
                      <td>texto</td>
                      <td>Janeiro, Fevereiro, Março...</td>
                    </tr>
                    <tr className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                      <td className="py-2 font-mono text-primary">Categoria</td>
                      <td>texto</td>
                      <td>Custo Fixo, Faturamento, Imposto, Margem, RESULTADO...</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-primary">Valor</td>
                      <td>moeda (R$)</td>
                      <td>R$ 381.305,69</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs mb-4 text-gray-600">Arquivo: <span className="text-primary font-mono">Dashboard_Financeiro_Exemplo.xlsx</span></p>

              {/* Botão Download */}
              <a data-cta-button href="https://docs.google.com/spreadsheets/d/1najlHXbyJLlXJSB12xPWHXi4rRS0kWDtMew301HjitQ/export?format=xlsx" download className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors w-full">
                <span className="material-symbols-outlined text-base">download</span>
                Baixar Arquivo
              </a>
            </div>
          </div>
        </div>
      </div>
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
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Demonstração do Resultado do Exercício - Análise Detalhada
          </p>
        </div>

        {/* Tabs de Visualização */}
        <div className={`flex gap-2 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-1`}>
          {[
            { id: 'mensal' as ViewType, label: 'Projetado vs Real', icon: 'calendar_month' },
            { id: 'acumulado' as ViewType, label: 'Acumulado Mensal', icon: 'trending_up' },
            { id: 'comparativo' as ViewType, label: 'Comparativo Regimes', icon: 'compare' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${viewType === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
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
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center`}>
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Processando arquivo...</p>
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
          <div className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
              <div className="flex-1">
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Informações sobre as Tabelas</h4>
                <ul className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
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
