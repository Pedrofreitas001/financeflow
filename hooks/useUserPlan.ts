// hooks/useUserPlan.ts
// Hook para verificar plano do usuário (free, premium, diamond)

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserPlan {
    plan: 'free' | 'premium' | 'diamond';
    status: 'active' | 'canceled' | 'expired' | 'trialing';
    isPremium: boolean;
    isDiamond: boolean;
    expiresAt: string | null;
    daysRemaining: number | null;
    userId: string | null;
}

export function useUserPlan(userId?: string) {
    const [userPlan, setUserPlan] = useState<UserPlan>({
        plan: 'free',
        status: 'active',
        isPremium: false,
        isDiamond: false,
        expiresAt: null,
        daysRemaining: null,
        userId: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchUserPlan() {
            try {
                // Se não houver userId, pega o usuário atual
                let actualUserId = userId;
                if (!actualUserId) {
                    const { data: { user }, error: userError } = await supabase.auth.getUser();
                    if (userError) throw userError;
                    if (!user) {
                        console.log('[useUserPlan] Nenhum usuário autenticado');
                        setLoading(false);
                        return;
                    }
                    actualUserId = user.id;
                    console.log('[useUserPlan] Usuário atual:', actualUserId);
                }

                const { data, error: err } = await supabase
                    .from('subscriptions')
                    .select('plan, status, created_at')
                    .eq('user_id', actualUserId)
                    .single();

                console.log('[useUserPlan] Query resultado:', { data, error: err?.code || err?.message });

                if (err && err.code !== 'PGRST116') {
                    // PGRST116 = não encontrado, o que é normal para free users
                    throw err;
                }

                if (data) {
                    console.log('[useUserPlan] Subscription encontrada:', data.plan);
                    const rawPlan = String(data.plan || 'free').trim().toLowerCase();
                    const rawStatus = String(data.status || 'active').trim().toLowerCase();
                    const normalizedPlan = rawPlan === 'trial' ? 'premium' : rawPlan;
                    const status = (rawStatus as UserPlan['status']) || 'active';
                    const isPaidStatus = status === 'active' || status === 'trialing';
                    const isPremium = normalizedPlan === 'premium' && isPaidStatus;
                    const isDiamond = normalizedPlan === 'diamond' && status === 'active';

                    setUserPlan({
                        plan: (normalizedPlan as UserPlan['plan']) || 'free',
                        status,
                        isPremium,
                        isDiamond,
                        expiresAt: null,
                        daysRemaining: null,
                        userId: actualUserId,
                    });
                } else {
                    // Free user (sem subscription)
                    console.log('[useUserPlan] Nenhuma subscription encontrada - free user');
                    setUserPlan(prev => ({
                        ...prev,
                        plan: 'free',
                        userId: actualUserId,
                    }));
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
                const errorCode = (err as any)?.code || (err as any)?.error_code || 'UNKNOWN';
                console.error('[useUserPlan] Erro ao buscar plano:', errorMsg, 'Code:', errorCode);
                setError(err instanceof Error ? err : new Error('Erro ao buscar plano do usuário'));
            } finally {
                setLoading(false);
            }
        }

        fetchUserPlan();
    }, [userId]);

    return { userPlan, loading, error };
}
