// components/Settings/InsightsManager.tsx
// Gerenciador de insights salvos com opção de deletar

import { useEffect, useState } from 'react';
import { getAIInsights, deleteAIInsight } from '@/utils/aiInsightsManager';

interface AIInsight {
    id: string;
    analysisType: string;
    insights: Record<string, any>;
    tokensUsed: number;
    confidenceScore: number;
    createdAt: string;
}

interface InsightsManagerProps {
    userId: string;
    dashboardType: string;
}

export default function InsightsManager({ userId, dashboardType }: InsightsManagerProps) {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadInsights();
    }, [userId, dashboardType]);

    async function loadInsights() {
        try {
            setLoading(true);
            const data = await getAIInsights(userId, dashboardType);
            setInsights(data);
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
            const success = await deleteAIInsight(userId, insightId);
            if (success) {
                setInsights(insights.filter((i) => i.id !== insightId));
                alert('Insight deletado com sucesso');
            } else {
                alert('Erro ao deletar insight');
            }
        } finally {
            setDeleting(null);
        }
    }

    if (loading) {
        return (
            <div className="text-slate-400 text-sm py-3">Carregando insights...</div>
        );
    }

    if (insights.length === 0) {
        return (
            <div className="bg-slate-800/30 border border-slate-700 rounded p-3 text-center">
                <p className="text-slate-400 text-sm">🧠 Nenhum insight salvo ainda</p>
                <p className="text-slate-500 text-xs mt-1">
                    Use o chat de IA para criar insights e salve-os aqui
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-100 text-sm">
                    Insights Salvos ({insights.length})
                </h3>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                    {dashboardType}
                </span>
            </div>

            <div className="space-y-2">
                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        className="bg-slate-800/50 border border-slate-700 rounded p-2 hover:bg-slate-800/70 transition"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-100 text-xs mb-1">
                                    🧠 {insight.insights?.title || insight.analysisType}
                                </h4>

                                <p className="text-xs text-slate-300 line-clamp-2">
                                    {insight.insights?.content || JSON.stringify(insight.insights)}
                                </p>

                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                    <span>{insight.tokensUsed} tokens</span>
                                    <span>⭐ {(insight.confidenceScore * 100).toFixed(0)}%</span>
                                    <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
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

            <div className="bg-slate-800/50 border border-slate-700 rounded p-2 mt-3">
                <p className="text-xs text-slate-300">
                    💡 Insights contam para o seu limite mensal do plano
                </p>
            </div>
        </div>
    );
}
