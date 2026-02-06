import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { analyzeDashboardData, type AnalysisType, type AnalysisResult } from '../../utils/dashboardAIAnalysis';
import { useFinance } from '../../context/FinanceContext';
import { useDespesas } from '../../context/DespesasContext';
import { useDRE } from '../../context/DREContext';
import { useAIInsights, type SavedInsight } from '../../utils/useAIInsights';
import { useUserPlan } from '../../hooks/useUserPlan';
import { useAuth } from '../../context/AuthContext';
import PremiumModal from '../PremiumModal';
import { Brain, Loader, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

// Interface para exibição unificada (tanto mock quanto real)
interface DisplayInsight {
    id: string;
    title: string;
    summary: string;
    category: string;
    date: string;
    tags: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'warning';
    // Dados completos do Supabase (se disponível)
    savedData?: SavedInsight;
}

const DashboardAIInsights: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { kpis, agregadoMensal, agregadoCategoria, filtros } = useFinance();
    const { categoriaSummary } = useDespesas();
    const { dreData } = useDRE();
    const { saveInsight, savedInsights, fetchAllInsights, deleteInsight, isLoading: insightsLoading } = useAIInsights();
    const { user } = useAuth();
    const { userPlan } = useUserPlan(user?.id);

    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    const [selectedInsight, setSelectedInsight] = useState<DisplayInsight | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDashboardSelector, setShowDashboardSelector] = useState(false);
    const [generatedAnalysis, setGeneratedAnalysis] = useState<AnalysisResult | null>(null);
    const [selectedDashboard, setSelectedDashboard] = useState<AnalysisType | null>(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Diamond e Premium têm acesso total
    const hasAccess = userPlan.isDiamond || userPlan.isPremium;

    const dashboardOptions = [
        { id: 'visao_geral' as AnalysisType, name: 'Visão Geral', icon: '📊', description: 'Análise estratégica geral' },
        { id: 'despesas' as AnalysisType, name: 'Despesas', icon: '💰', description: 'Otimização de custos' },
        { id: 'dre' as AnalysisType, name: 'DRE', icon: '📈', description: 'Análise de margens' },
        { id: 'fluxo_caixa' as AnalysisType, name: 'Fluxo de Caixa', icon: '💵', description: 'Gestão de liquidez' },
        { id: 'balancete' as AnalysisType, name: 'Balancete', icon: '⚖️', description: 'Solidez financeira' },
    ];

    const handleGenerateRealInsight = async (dashboardType: AnalysisType) => {
        setIsGenerating(true);
        setSelectedDashboard(dashboardType);
        setShowDashboardSelector(false);

        try {
            let data: any = {};
            const period = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

            // Preparar dados específicos para cada tipo de dashboard
            switch (dashboardType) {
                case 'visao_geral':
                    data = {
                        kpis: {
                            receita: kpis.faturamentoLiquido,
                            despesas: kpis.despesaTotal,
                            lucro: kpis.resultado,
                            margem: kpis.margemLiquida,
                            margemContribuicao: kpis.margemContribuicao,
                            margemContribuicaoPerc: kpis.margemContribuicaoPerc
                        },
                        evolution: agregadoMensal,
                        categorias: agregadoCategoria,
                        empresa: filtros.empresa,
                        periodo: filtros.meses
                    };
                    break;
                case 'despesas':
                    data = {
                        categories: agregadoCategoria,
                        total: kpis.despesaTotal,
                        summary: categoriaSummary,
                        evolution: agregadoMensal,
                        empresa: filtros.empresa,
                        periodo: filtros.meses
                    };
                    break;
                case 'dre':
                    data = {
                        ...dreData,
                        empresa: filtros.empresa,
                        periodo: filtros.meses
                    };
                    break;
                default:
                    data = { kpis };
            }

            const result = await analyzeDashboardData({
                type: dashboardType,
                period,
                data,
                context: {
                    companyName: filtros.empresa || 'Sua Empresa',
                    industry: localStorage.getItem('business_segment') || undefined,
                    location: localStorage.getItem('business_location') || undefined,
                    companySize: localStorage.getItem('business_size') || undefined,
                    foundedYear: localStorage.getItem('business_year') || undefined,
                    notes: localStorage.getItem('business_notes') || undefined
                }
            });

            setGeneratedAnalysis(result);

            // Salvar insight no Supabase
            try {
                const businessContext = {
                    segmento: localStorage.getItem('business_segment'),
                    localizacao: localStorage.getItem('business_location'),
                    porte: localStorage.getItem('business_size'),
                    anoFundacao: localStorage.getItem('business_year'),
                    observacoes: localStorage.getItem('business_notes')
                };

                console.log('💾 Tentando salvar insight no Supabase...');
                const savedInsight = await saveInsight(
                    filtros.empresa || 'Empresa',
                    dashboardType,
                    period,
                    result,
                    businessContext,
                    { kpis, agregadoMensal, agregadoCategoria } // Dados brutos
                );

                if (savedInsight) {
                    console.log('✅ Insight salvo com sucesso no Supabase!', savedInsight.id);
                } else {
                    console.warn('⚠️ Insight não foi salvo (possível erro de autenticação ou tabela não criada)');
                }
            } catch (saveError) {
                console.error('❌ Erro ao salvar insight no Supabase:', saveError);
                console.log('💡 Verifique se você executou o script SUPABASE_AI_INSIGHTS_SETUP.sql');
            }
        } catch (error) {
            console.error('Erro ao gerar insight:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            alert(`Erro ao gerar análise:\n\n${errorMessage}\n\nSe o erro for sobre API Key:\n1. Verifique se o arquivo .env existe na raiz do projeto\n2. Confirme que contém: VITE_GEMINI_API_KEY=sua-chave\n3. Reinicie o servidor (Ctrl+C e depois npm run dev)`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Mapeamento de dashboard_type para labels legíveis
    const dashboardTypeLabels: Record<string, string> = {
        visao_geral: 'Visão Geral',
        despesas: 'Despesas',
        dre: 'DRE',
        fluxo_caixa: 'Fluxo de Caixa',
        balancete: 'Balancete',
        indicadores: 'Indicadores',
        orcamento: 'Orçamento',
    };

    // Converte SavedInsight do Supabase em DisplayInsight para a UI
    const convertToDisplayInsight = (saved: SavedInsight): DisplayInsight => {
        const insightsData = saved.insights || {} as any;
        const confidence = saved.confidence_score || 0;

        // Determinar sentiment baseado no confidence
        let sentiment: 'positive' | 'neutral' | 'negative' | 'warning' = 'neutral';
        if (confidence >= 0.8) sentiment = 'positive';
        else if (confidence >= 0.6) sentiment = 'warning';
        else if (confidence < 0.5) sentiment = 'negative';

        // Verificar se tem alertas => warning
        if (insightsData.alerts && insightsData.alerts.length > 0) {
            sentiment = 'warning';
        }

        const title = insightsData.empresa
            ? `${dashboardTypeLabels[saved.dashboard_type] || saved.dashboard_type} - ${insightsData.empresa}`
            : dashboardTypeLabels[saved.dashboard_type] || saved.dashboard_type;

        return {
            id: saved.id,
            title,
            summary: insightsData.summary || 'Análise gerada por IA',
            category: saved.dashboard_type,
            date: new Date(saved.created_at).toLocaleDateString('pt-BR'),
            tags: [
                saved.dashboard_type,
                ...(insightsData.periodo ? [insightsData.periodo] : []),
                `${(confidence * 100).toFixed(0)}% confiança`
            ],
            sentiment,
            savedData: saved,
        };
    };

    // Insights reais do Supabase convertidos para display
    const displayInsights: DisplayInsight[] = savedInsights.map(convertToDisplayInsight);

    const categories = [
        { id: 'todos', label: 'Todos', icon: 'apps' },
        { id: 'visao_geral', label: 'Visão Geral', icon: 'insights' },
        { id: 'despesas', label: 'Despesas', icon: 'receipt_long' },
        { id: 'dre', label: 'DRE', icon: 'bar_chart' },
        { id: 'fluxo_caixa', label: 'Fluxo de Caixa', icon: 'trending_up' },
        { id: 'balancete', label: 'Balancete', icon: 'account_balance' },
    ];

    const filteredInsights = selectedCategory === 'todos'
        ? displayInsights
        : displayInsights.filter(i => i.category === selectedCategory);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-500 bg-green-500/10';
            case 'negative': return 'text-red-500 bg-red-500/10';
            case 'warning': return 'text-amber-500 bg-amber-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'thumb_up';
            case 'negative': return 'thumb_down';
            case 'warning': return 'warning';
            case 'neutral': return 'info';
            default: return 'info';
        }
    };

    const handleGenerateInsight = () => {
        if (!hasAccess) {
            setShowPremiumModal(true);
            return;
        }
        setShowDashboardSelector(true);
    };

    return (
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-slate-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Insights de IA
                            </h1>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Análises inteligentes geradas pelo Gemini para otimizar suas finanças
                            </p>
                        </div>
                        <button
                            onClick={handleGenerateInsight}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Gerar Novo Insight
                                </>
                            )}
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${selectedCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : isDark
                                        ? 'bg-surface-dark text-gray-400 hover:bg-gray-800 hover:text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resultado da Análise Real */}
                {generatedAnalysis && (
                    <div className={`mb-6 p-6 rounded-2xl border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    📊 Análise: {selectedDashboard?.replace('_', ' ').toUpperCase()}
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Gerado em {new Date().toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <button
                                onClick={() => setGeneratedAnalysis(null)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                            >
                                <span className={`material-symbols-outlined ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>close</span>
                            </button>
                        </div>

                        {/* Insights */}
                        {generatedAnalysis.insights.length > 0 && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    ✨ Principais Insights
                                </h3>
                                <div className="space-y-3">
                                    {generatedAnalysis.insights.map((insight, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trends */}
                        {generatedAnalysis.trends.length > 0 && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    📈 Tendências Identificadas
                                </h3>
                                <div className="space-y-3">
                                    {generatedAnalysis.trends.map((trend, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{trend}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alerts */}
                        {generatedAnalysis.alerts.length > 0 && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    <span className="text-amber-500">⚠️</span> Pontos de Atenção
                                </h3>
                                <div className="space-y-3">
                                    {generatedAnalysis.alerts.map((alert, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border-l-4 border-amber-500 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{alert}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {generatedAnalysis.recommendations.length > 0 && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    <span className="text-green-500">✅</span> Recomendações
                                </h3>
                                <div className="space-y-3">
                                    {generatedAnalysis.recommendations.map((rec, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Confidence */}
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Confiança da Análise
                                </span>
                                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {generatedAnalysis.confidence}%
                                </span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                    style={{ width: `${generatedAnalysis.confidence}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Insights Grid/Modal */}
                {!selectedInsight ? (
                    <div className="grid gap-6">
                        {filteredInsights.map(insight => (
                            <div
                                key={insight.id}
                                onClick={() => setSelectedInsight(insight)}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.01] ${isDark
                                    ? 'bg-surface-dark border-border-dark hover:border-blue-500/50'
                                    : 'bg-white border-gray-200 hover:border-blue-400'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${getSentimentColor(insight.sentiment)}`}>
                                            <span className="material-symbols-outlined text-2xl">
                                                {getSentimentIcon(insight.sentiment)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {insight.title}
                                            </h3>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {insight.date}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`material-symbols-outlined ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                        chevron_right
                                    </span>
                                </div>

                                <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {insight.summary}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {insight.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark
                                                ? 'bg-blue-900/30 text-blue-300'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {insightsLoading && filteredInsights.length === 0 && (
                            <div className={`text-center py-16 rounded-2xl border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'}`}>
                                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Carregando insights salvos...</p>
                            </div>
                        )}

                        {!insightsLoading && filteredInsights.length === 0 && (
                            <div className={`text-center py-16 rounded-2xl border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'
                                }`}>
                                <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">
                                    psychology_alt
                                </span>
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {selectedCategory === 'todos' ? 'Nenhum insight salvo ainda' : 'Nenhum insight nesta categoria'}
                                </h3>
                                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Gere novos insights para visualizar análises aqui
                                </p>
                                <button
                                    onClick={handleGenerateInsight}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Gerar Primeiro Insight
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Insight Detail - dados reais do Supabase */
                    <div className={`rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'
                        }`}>
                        {/* Header */}
                        <div className={`p-6 border-b ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
                            <button
                                onClick={() => setSelectedInsight(null)}
                                className={`flex items-center gap-2 mb-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Voltar aos Insights
                            </button>
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${getSentimentColor(selectedInsight.sentiment)}`}>
                                    <span className="material-symbols-outlined text-3xl">
                                        {getSentimentIcon(selectedInsight.sentiment)}
                                    </span>
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedInsight.title}
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Gerado em {selectedInsight.date}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedInsight.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Content - estruturado a partir dos dados salvos */}
                        <div className="p-8 space-y-6">
                            {/* Summary */}
                            {selectedInsight.summary && (
                                <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                    <p className={`leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{selectedInsight.summary}</p>
                                </div>
                            )}

                            {/* Insights */}
                            {selectedInsight.savedData?.insights?.insights && selectedInsight.savedData.insights.insights.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        ✨ Principais Insights
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedInsight.savedData.insights.insights.map((item: string, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                                                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trends */}
                            {selectedInsight.savedData?.insights?.trends && selectedInsight.savedData.insights.trends.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        📈 Tendências
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedInsight.savedData.insights.trends.map((item: string, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                                                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alerts */}
                            {selectedInsight.savedData?.insights?.alerts && selectedInsight.savedData.insights.alerts.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        ⚠️ Pontos de Atenção
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedInsight.savedData.insights.alerts.map((item: string, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-lg border-l-4 border-amber-500 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                                                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {selectedInsight.savedData?.insights?.recommendations && selectedInsight.savedData.insights.recommendations.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        ✅ Recomendações
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedInsight.savedData.insights.recommendations.map((item: string, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                                                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Confidence */}
                            {selectedInsight.savedData && (
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Confiança da Análise
                                        </span>
                                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {((selectedInsight.savedData.confidence_score || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                            style={{ width: `${(selectedInsight.savedData.confidence_score || 0) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className={`p-6 border-t flex gap-3 ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
                            <button
                                onClick={async () => {
                                    if (selectedInsight?.id) {
                                        const ok = await deleteInsight(selectedInsight.id);
                                        if (ok) setSelectedInsight(null);
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                <span className="material-symbols-outlined">delete</span>
                                Excluir
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de seleção de dashboard */}
            {showDashboardSelector && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className={`max-w-2xl w-full rounded-2xl shadow-2xl ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>
                        {/* Header */}
                        <div className={`p-6 border-b ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Selecione o Dashboard
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Escolha qual área você deseja analisar com IA
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDashboardSelector(false)}
                                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                >
                                    <span className={`material-symbols-outlined ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>close</span>
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-6 grid gap-3">
                            {dashboardOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleGenerateRealInsight(option.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${isDark
                                        ? 'border-border-dark hover:border-blue-500 bg-background-dark'
                                        : 'border-gray-200 hover:border-blue-500 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{option.icon}</div>
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {option.name}
                                            </h3>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {option.description}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-blue-500">arrow_forward</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Modal */}
            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                feature="Insights de IA"
                description="Gere análises inteligentes com IA para otimizar suas finanças e tomar decisões estratégicas."
            />
        </main>
    );
};

export default DashboardAIInsights;
