// utils/aiInsightsManager.ts
// Utilitário para salvar análises de IA com tracking de tokens

import { supabase } from '@/lib/supabase';
import { logUsage } from './usageTracker';

export interface AIInsight {
    id: string;
    userId: string;
    dashboardType: string;
    analysisType: string;
    insights: Record<string, any>;
    tokensUsed: number;
    confidenceScore: number;
    createdAt: string;
}

export async function saveAIInsight(
    userId: string,
    dashboardType: string,
    analysisType: string,
    insights: Record<string, any>,
    tokensUsed: number,
    confidenceScore: number = 0.85
): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('ai_insights')
            .insert({
                user_id: userId,
                dashboard_type: dashboardType,
                analysis_type: analysisType,
                insights,
                tokens_used: tokensUsed,
                confidence_score: confidenceScore
            })
            .select('id')
            .single();

        if (error) throw error;

        // Log de uso
        await logUsage(userId, 'ai_analysis', {
            dashboard_type: dashboardType,
            analysis_type: analysisType,
            tokens_used: tokensUsed
        });

        return {
            success: true,
            id: data?.id
        };
    } catch (error) {
        console.error('Erro ao salvar insight de IA:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
    }
}

export async function getAIInsights(
    userId: string,
    dashboardType?: string,
    limit: number = 10
): Promise<AIInsight[]> {
    try {
        let query = supabase
            .from('ai_insights')
            .select('id, user_id, dashboard_type, analysis_type, insights, tokens_used, confidence_score, created_at')
            .eq('user_id', userId);

        if (dashboardType) {
            query = query.eq('dashboard_type', dashboardType);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (
            data?.map((d) => ({
                id: d.id,
                userId: d.user_id,
                dashboardType: d.dashboard_type,
                analysisType: d.analysis_type,
                insights: d.insights,
                tokensUsed: d.tokens_used,
                confidenceScore: d.confidence_score,
                createdAt: d.created_at
            })) || []
        );
    } catch (error) {
        console.error('Erro ao buscar insights:', error);
        return [];
    }
}

export async function getTotalTokensUsed(userId: string, monthOffset: number = 0): Promise<number> {
    try {
        const date = new Date();
        date.setMonth(date.getMonth() - monthOffset);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);

        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const { data, error } = await supabase
            .from('ai_insights')
            .select('tokens_used')
            .eq('user_id', userId)
            .gte('created_at', date.toISOString())
            .lt('created_at', nextMonth.toISOString());

        if (error) throw error;

        return data?.reduce((sum, insight) => sum + (insight.tokens_used || 0), 0) || 0;
    } catch (error) {
        console.error('Erro ao calcular tokens:', error);
        return 0;
    }
}

export function estimateTokensUsed(text: string): number {
    // Estimativa rough: ~4 caracteres por token
    return Math.ceil(text.length / 4);
}
export async function deleteAIInsight(userId: string, insightId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('ai_insights')
            .delete()
            .eq('id', insightId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao deletar insight:', error);
        return false;
    }
}