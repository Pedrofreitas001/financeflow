// hooks/useSubscriptionChanges.ts
// Hook para escutar mudanças de plano em tempo real

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useSubscriptionChanges(userId: string | undefined, onPlanChanged?: (newPlan: string, oldPlan?: string) => void) {
    const handleSubscriptionChange = useCallback(() => {
        // Trigger refresh do useUserPlan
        if (onPlanChanged) {
            onPlanChanged('updated', undefined);
        }
    }, [onPlanChanged]);

    useEffect(() => {
        if (!userId) return;

        // Escutar notificações do banco
        const subscription = supabase
            .channel('subscription_changes')
            .on('broadcast', { event: 'plan_changed' }, (payload) => {
                console.log('[useSubscriptionChanges] Plano mudou:', payload.payload);
                handleSubscriptionChange();
            })
            .subscribe();

        // Também escutar mudanças diretas na tabela
        const realtimeSubscription = supabase
            .channel(`subscriptions:user_id=eq.${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('[useSubscriptionChanges] Mudança detectada:', payload);
                    handleSubscriptionChange();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
            realtimeSubscription.unsubscribe();
        };
    }, [userId, handleSubscriptionChange]);
}
