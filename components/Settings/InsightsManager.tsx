// components/Settings/InsightsManager.tsx
// Gerenciador de insights salvos com seletor de tipo de dashboard

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SavedInsightRow {
    id: string;
    dashboard_type: string;
    analysis_type: string;
    insights: any;
    tokens_used: number;
    confidence_score: number;
    created_at: string;
}

interface InsightsManagerProps {
    userId: string;
    dashboardType?: string;
}

const DASHBOARD_TYPES = [
    { value: '', label: 'Todos os tipos' },
    { value: 'visao_geral', label: 'Visão Geral' },
    { value: 'despesas', label: 'Despesas' },
    { value: 'dre', label: 'DRE' },
    { value: 'fluxo_caixa', label: 'Fluxo de Caixa' },
    { value: 'balancete', label: 'Balancete' },
    { value: 'indicadores', label: 'Indicadores' },
    { value: 'orcamento', label: 'Orçamento' },
];

export default function InsightsManager({ userId, dashboardType: initialType }: InsightsManagerProps) {
    const [insights, setInsights] = useState<SavedInsightRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState(initialType || '');

    useEffect(() => {
        loadInsights();
    }, [userId, selectedType]);

    async function loadInsights() {
        try {
            setLoading(true);
            let query = supabase
                .from('ai_insights')
                .select('id, dashboard_type, analysis_type, insights, tokens_used, confidence_score, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (selectedType) {
                query = query.eq('dashboard_type', selectedType);
            }

            const { data, error } = await query;
            if (error) throw error;
            setInsights(data || []);
        } catch (error) {
            console.error('Erro ao carregar insights:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(insightId: string) {
        if (!confirm('Tem certeza que deseja deletar este insight?')) return;

        try {
            setDeleting(insightId);
            const { error } = await supabase
                .from('ai_insights')
                .delete()
                .eq('id', insightId)
                .eq('user_id', userId);

            if (!error) {
                setInsights(insights.filter((i) => i.id !== insightId));
            }
        } finally {
            setDeleting(null);
        }
    }

    function getInsightTitle(insight: SavedInsightRow): string {
        const data = insight.insights;
        if (data?.empresa) return `${data.empresa} - ${insight.dashboard_type}`;
        if (data?.summary) return data.summary.slice(0, 60) + (data.summary.length > 60 ? '...' : '');
        return insight.dashboard_type || insight.analysis_type || 'Insight';
    }

    function getInsightSummary(insight: SavedInsightRow): string {
        const data = insight.insights;
        if (data?.summary) return data.summary;
        if (data?.insights && Array.isArray(data.insights)) return data.insights[0] || '';
        if (typeof data === 'object') return JSON.stringify(data).slice(0, 120) + '...';
        return '';
    }

    return (
        <div className="space-y-3">
            {/* Seletor de tipo */}
            <div className="flex items-center gap-3 mb-3">
                <label className="text-xs font-semibold text-slate-400">Filtrar por:</label>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-slate-800/50 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                >
                    {DASHBOARD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-slate-400 text-sm py-3">Carregando insights...</div>
            ) : insights.length === 0 ? (
                <div className="bg-slate-800/30 border border-slate-700 rounded p-3 text-center">
                    <p className="text-slate-400 text-sm">Nenhum insight salvo{selectedType ? ` para ${selectedType}` : ''}</p>
                    <p className="text-slate-500 text-xs mt-1">
                        Use a aba Insights de IA para gerar e salvar análises
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-100 text-sm">
                            Insights Salvos ({insights.length})
                        </h3>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        {insights.map((insight) => (
                            <div
                                key={insight.id}
                                className="bg-slate-800/50 border border-slate-700 rounded p-2 hover:bg-slate-800/70 transition"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                                                {insight.dashboard_type}
                                            </span>
                                            {insight.insights?.periodo && (
                                                <span className="text-xs text-slate-500">
                                                    {insight.insights.periodo}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-medium text-slate-100 text-xs mb-1">
                                            {getInsightTitle(insight)}
                                        </h4>

                                        <p className="text-xs text-slate-300 line-clamp-2">
                                            {getInsightSummary(insight)}
                                        </p>

                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                            <span>{insight.tokens_used || 0} tokens</span>
                                            <span>{((insight.confidence_score || 0) * 100).toFixed(0)}% confiança</span>
                                            <span>{new Date(insight.created_at).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(insight.id)}
                                        disabled={deleting === insight.id}
                                        className="p-1 rounded text-red-400 hover:bg-red-500/20 text-sm transition disabled:opacity-50 flex-shrink-0"
                                        title="Deletar"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
