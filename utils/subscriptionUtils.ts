import { useState } from 'react';

export const useSubscription = () => {
    // Mock - substituir por dados reais do Supabase
    const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'premium' | 'trial'>('trial');

    const isPremium = subscriptionStatus === 'premium';
    const isTrial = subscriptionStatus === 'trial';

    return {
        subscriptionStatus,
        isPremium,
        isTrial,
        setSubscriptionStatus
    };
};

export const checkPremiumFeature = (subscriptionStatus: 'free' | 'premium' | 'trial'): boolean => {
    return subscriptionStatus === 'premium';
};
