/**
 * Hook para gerenciar insights de IA no Supabase
 * 
 * Funcionalidades:
 * - Salvar insights gerados
 * - Buscar histórico de insights
 * - Buscar insights por empresa/período
 */

import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { AnalysisResult, AnalysisType } from '../utils/dashboardAIAnalysis';

export interface SavedInsight {
    id: string;
    user_id: string;
    empresa: string;
    dashboard_type: AnalysisType;
    periodo: string;
    insights: string[];
    trends: string[];
    alerts: string[];
    recommendations: string[];
    summary: string;
    confidence: number;
    business_context?: any;
    raw_data?: any;
    created_at: string;
    updated_at: string;
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
            const { data, error: saveError } = await supabase
                .from('ai_insights')
                .insert({
                    user_id: user.id,
                    empresa,
                    dashboard_type: dashboardType,
                    periodo,
                    insights: analysisResult.insights,
                    trends: analysisResult.trends,
                    alerts: analysisResult.alerts,
                    recommendations: analysisResult.recommendations,
                    summary: analysisResult.summary,
                    confidence: analysisResult.confidence,
                    business_context: businessContext,
                    raw_data: rawData
                })
                .select()
                .single();

            if (saveError) throw saveError;

            console.log('✅ Insight salvo no Supabase:', data.id);
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
    const fetchAllInsights = async (): Promise<SavedInsight[]> => {
        if (!user) {
            setError('Usuário não autenticado');
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

            setSavedInsights(data || []);
            return data || [];
        } catch (err) {
            console.error('❌ Erro ao buscar insights:', err);
            setError(err instanceof Error ? err.message : 'Erro ao buscar insights');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Buscar insights de uma empresa específica
     */
    const fetchInsightsByEmpresa = async (empresa: string): Promise<SavedInsight[]> => {
        if (!user) return [];

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .eq('empresa', empresa)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            return data || [];
        } catch (err) {
            console.error('❌ Erro ao buscar insights por empresa:', err);
            setError(err instanceof Error ? err.message : 'Erro ao buscar insights');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Buscar insights por tipo de dashboard
     */
    const fetchInsightsByType = async (dashboardType: AnalysisType): Promise<SavedInsight[]> => {
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

            return data || [];
        } catch (err) {
            console.error('❌ Erro ao buscar insights por tipo:', err);
            setError(err instanceof Error ? err.message : 'Erro ao buscar insights');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Buscar insights mais recentes (limit)
     */
    const fetchRecentInsights = async (limit: number = 10): Promise<SavedInsight[]> => {
        if (!user) return [];

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (fetchError) throw fetchError;

            return data || [];
        } catch (err) {
            console.error('❌ Erro ao buscar insights recentes:', err);
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
            // Atualizar lista local
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
                .select('dashboard_type, confidence')
                .eq('user_id', user.id);

            if (fetchError) throw fetchError;

            const stats = {
                total: data.length,
                byType: {} as Record<string, number>,
                avgConfidence: 0
            };

            data.forEach((insight: any) => {
                stats.byType[insight.dashboard_type] = (stats.byType[insight.dashboard_type] || 0) + 1;
            });

            const totalConfidence = data.reduce((sum: number, i: any) => sum + (i.confidence || 0), 0);
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
    }, [user]);

    return {
        // Estados
        savedInsights,
        isLoading,
        error,

        // Métodos
        saveInsight,
        fetchAllInsights,
        fetchInsightsByEmpresa,
        fetchInsightsByType,
        fetchRecentInsights,
        deleteInsight,
        fetchInsightsStats
    };
};
