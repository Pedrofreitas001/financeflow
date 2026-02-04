// utils/planManager.ts
// Utilitários para gerenciar planos de usuários

import { supabase } from '@/lib/supabase';

export type Plan = 'free' | 'premium' | 'diamond';

export interface PlanUpdateResult {
    success: boolean;
    message: string;
    oldPlan?: string;
    newPlan?: string;
    userId?: string;
    error?: string;
}

/**
 * Atualizar plano de um usuário
 * Usa a função SQL criada para automatizar tudo
 */
export async function updateUserPlan(
    userId: string,
    newPlan: Plan,
    reason?: string
): Promise<PlanUpdateResult> {
    try {
        console.log(`[planManager] Alterando plano de ${userId} para ${newPlan}`);

        // Chamar a função SQL que criamos
        const { data, error } = await supabase.rpc('update_user_plan', {
            p_user_id: userId,
            p_new_plan: newPlan,
            p_reason: reason || `Mudança para ${newPlan}`,
        });

        if (error) {
            console.error('[planManager] Erro ao atualizar plano:', error);
            return {
                success: false,
                message: 'Erro ao atualizar plano',
                error: error.message,
            };
        }

        console.log('[planManager] Plano atualizado com sucesso:', data);
        return {
            success: true,
            message: data.message,
            oldPlan: data.old_plan,
            newPlan: data.new_plan,
            userId: data.user_id,
        };
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('[planManager] Erro:', errorMsg);
        return {
            success: false,
            message: 'Erro ao atualizar plano',
            error: errorMsg,
        };
    }
}

/**
 * Obter plano atual de um usuário
 */
export async function getCurrentUserPlan(userId: string): Promise<Plan | null> {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('plan')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error('[planManager] Erro ao buscar plano:', error);
            return null;
        }

        return (data?.plan as Plan) || 'free';
    } catch (err) {
        console.error('[planManager] Erro:', err);
        return null;
    }
}

/**
 * Criar subscription para novo usuário
 */
export async function createSubscription(
    userId: string,
    plan: Plan = 'free'
): Promise<PlanUpdateResult> {
    try {
        const { error } = await supabase.from('subscriptions').insert({
            user_id: userId,
            plan,
            status: 'active',
        });

        if (error) {
            console.error('[planManager] Erro ao criar subscription:', error);
            return {
                success: false,
                message: 'Erro ao criar subscription',
                error: error.message,
            };
        }

        return {
            success: true,
            message: 'Subscription criada com sucesso',
            newPlan: plan,
            userId,
        };
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        return {
            success: false,
            message: 'Erro ao criar subscription',
            error: errorMsg,
        };
    }
}

/**
 * Listar histórico de mudanças de plano
 */
export async function getPlanHistory(userId?: string) {
    try {
        let query = supabase
            .from('subscription_changes')
            .select('user_id, user_email, plan, status, reason, created_at, updated_at');

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) {
            console.error('[planManager] Erro ao buscar histórico:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[planManager] Erro:', err);
        return [];
    }
}

/**
 * Obter estatísticas de planos
 */
export async function getPlanStats() {
    try {
        const { data: allSubs, error } = await supabase
            .from('subscriptions')
            .select('plan');

        if (error) {
            console.error('[planManager] Erro ao buscar stats:', error);
            return {};
        }

        const stats: Record<string, number> = { free: 0, premium: 0, diamond: 0 };
        allSubs?.forEach((item: any) => {
            if (item.plan in stats) {
                stats[item.plan]++;
            }
        });

        return stats;
    } catch (err) {
        console.error('[planManager] Erro:', err);
        return {};
    }
}
