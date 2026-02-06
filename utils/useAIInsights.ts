/**
 * Hook para gerenciar insights de IA no Supabase
 *
 * Tabela ai_insights:
 *   id, user_id, dashboard_type, analysis_type, insights (JSONB),
 *   tokens_used, confidence_score, created_at, updated_at
 *
 * O campo `insights` JSONB armazena o resultado completo da análise:
 *   { empresa, periodo, insights[], trends[], alerts[], recommendations[],
 *     summary, business_context, raw_data }
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { AnalysisResult, AnalysisType } from '../utils/dashboardAIAnalysis';

export interface SavedInsight {
    id: string;
    user_id: string;
    dashboard_type: string;
    analysis_type: string;
    insights: {
        empresa?: string;
        periodo?: string;
        insights: string[];
        trends: string[];
        alerts: string[];
        recommendations: string[];
        summary: string;
        business_context?: any;
        raw_data?: any;
    };
    tokens_used: number;
    confidence_score: number;
    created_at: string;
    updated_at: string;
}

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

export const useAIInsights = () => {
    const { user } = useAuth();
    const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Salvar um novo insight no Supabase
     */
    const saveInsight = async (
        empresa: string,
        dashboardType: AnalysisType,
        periodo: string,
        analysisResult: AnalysisResult,
        businessContext?: any,
        rawData?: any
    ): Promise<SavedInsight | null> => {
        if (!user) {
            setError('Usuário não autenticado');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Armazena tudo no campo JSONB `insights`
            const insightsPayload = {
                empresa,
                periodo,
                insights: analysisResult.insights,
                trends: analysisResult.trends,
                alerts: analysisResult.alerts,
                recommendations: analysisResult.recommendations,
                summary: analysisResult.summary,
                business_context: businessContext,
                raw_data: rawData
            };

            const tokensUsed = estimateTokens(JSON.stringify(insightsPayload));
            const confidenceScore = Math.min(
                parseFloat((analysisResult.confidence / 100).toFixed(2)),
                0.99
            );

            const { data, error: saveError } = await supabase
                .from('ai_insights')
                .insert({
                    user_id: user.id,
                    dashboard_type: dashboardType,
                    analysis_type: dashboardType,
                    insights: insightsPayload,
                    tokens_used: tokensUsed,
                    confidence_score: confidenceScore
                })
                .select()
                .single();

            if (saveError) throw saveError;

            console.log('✅ Insight salvo no Supabase:', data.id);

            // Atualizar lista local
            setSavedInsights(prev => [data as SavedInsight, ...prev]);

            return data as SavedInsight;
        } catch (err) {
            console.error('❌ Erro ao salvar insight:', err);
            setError(err instanceof Error ? err.message : 'Erro ao salvar insight');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Buscar todos os insights do usuário
     */
    const fetchAllInsights = useCallback(async (): Promise<SavedInsight[]> => {
        if (!user) {
            return [];
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const insights = (data || []) as SavedInsight[];
            setSavedInsights(insights);
            return insights;
        } catch (err) {
            console.error('❌ Erro ao buscar insights:', err);
            setError(err instanceof Error ? err.message : 'Erro ao buscar insights');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Buscar insights por tipo de dashboard
     */
    const fetchInsightsByType = async (dashboardType: string): Promise<SavedInsight[]> => {
        if (!user) return [];

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .eq('dashboard_type', dashboardType)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            return (data || []) as SavedInsight[];
        } catch (err) {
            console.error('❌ Erro ao buscar insights por tipo:', err);
            setError(err instanceof Error ? err.message : 'Erro ao buscar insights');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Deletar um insight
     */
    const deleteInsight = async (insightId: string): Promise<boolean> => {
        if (!user) return false;

        setIsLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('ai_insights')
                .delete()
                .eq('id', insightId)
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;

            console.log('✅ Insight deletado:', insightId);
            setSavedInsights(prev => prev.filter(i => i.id !== insightId));
            return true;
        } catch (err) {
            console.error('❌ Erro ao deletar insight:', err);
            setError(err instanceof Error ? err.message : 'Erro ao deletar insight');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Buscar estatísticas de insights
     */
    const fetchInsightsStats = async () => {
        if (!user) return null;

        try {
            const { data, error: fetchError } = await supabase
                .from('ai_insights')
                .select('dashboard_type, confidence_score, tokens_used')
                .eq('user_id', user.id);

            if (fetchError) throw fetchError;

            const stats = {
                total: data.length,
                byType: {} as Record<string, number>,
                avgConfidence: 0,
                totalTokens: 0
            };

            data.forEach((insight: any) => {
                stats.byType[insight.dashboard_type] = (stats.byType[insight.dashboard_type] || 0) + 1;
                stats.totalTokens += insight.tokens_used || 0;
            });

            const totalConfidence = data.reduce((sum: number, i: any) => sum + (i.confidence_score || 0), 0);
            stats.avgConfidence = data.length > 0 ? totalConfidence / data.length : 0;

            return stats;
        } catch (err) {
            console.error('❌ Erro ao buscar estatísticas:', err);
            return null;
        }
    };

    // Auto-carregar insights ao montar o componente
    useEffect(() => {
        if (user) {
            fetchAllInsights();
        }
    }, [user, fetchAllInsights]);

    return {
        savedInsights,
        isLoading,
        error,
        saveInsight,
        fetchAllInsights,
        fetchInsightsByType,
        deleteInsight,
        fetchInsightsStats
    };
};
