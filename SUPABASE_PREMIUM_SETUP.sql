-- =====================================================
-- SCRIPT PARA GERENCIAR ASSINATURAS PREMIUM
-- =====================================================
-- Execute no SQL Editor do Supabase

-- =====================================================
-- 1. CRIAR TABELA DE ASSINATURAS (Se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'premium', 'trial')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trialing')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE public.subscriptions IS 'Tabela de assinaturas e planos dos usuários';
COMMENT ON COLUMN public.subscriptions.plan IS 'Plano do usuário: free, premium, trial';
COMMENT ON COLUMN public.subscriptions.status IS 'Status da assinatura: active, canceled, expired, trialing';

-- =====================================================
-- 2. TORNAR USUÁRIO PREMIUM
-- =====================================================

-- OPÇÃO A: Tornar premium por EMAIL
-- Substitua 'usuario@email.com' pelo email real do usuário

INSERT INTO public.subscriptions (user_id, plan, status, started_at, expires_at)
SELECT 
    id, 
    'premium', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year' -- Válido por 1 ano
FROM auth.users
WHERE email = 'usuario@email.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    plan = 'premium',
    status = 'active',
    started_at = NOW(),
    expires_at = NOW() + INTERVAL '1 year',
    updated_at = NOW();

-- =====================================================
-- OPÇÃO B: Tornar premium por USER_ID
-- =====================================================
-- Substitua 'UUID_DO_USUARIO' pelo UUID real

/*
INSERT INTO public.subscriptions (user_id, plan, status, started_at, expires_at)
VALUES (
    'UUID_DO_USUARIO',
    'premium',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    plan = 'premium',
    status = 'active',
    started_at = NOW(),
    expires_at = NOW() + INTERVAL '1 year',
    updated_at = NOW();
*/

-- =====================================================
-- 3. DAR TRIAL PREMIUM (7 dias)
-- =====================================================

/*
INSERT INTO public.subscriptions (user_id, plan, status, started_at, trial_ends_at)
SELECT 
    id, 
    'trial', 
    'trialing',
    NOW(),
    NOW() + INTERVAL '7 days'
FROM auth.users
WHERE email = 'usuario@email.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    plan = 'trial',
    status = 'trialing',
    started_at = NOW(),
    trial_ends_at = NOW() + INTERVAL '7 days',
    updated_at = NOW();
*/

-- =====================================================
-- 4. CANCELAR PREMIUM (volta para free)
-- =====================================================

/*
UPDATE public.subscriptions
SET 
    plan = 'free',
    status = 'canceled',
    expires_at = NOW(),
    updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'usuario@email.com'
);
*/

-- =====================================================
-- 5. QUERIES ÚTEIS
-- =====================================================

-- Ver todos os usuários premium
SELECT 
    u.email,
    s.plan,
    s.status,
    s.started_at,
    s.expires_at
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.plan = 'premium' AND s.status = 'active';

-- Ver usuários em trial
SELECT 
    u.email,
    s.plan,
    s.status,
    s.trial_ends_at,
    EXTRACT(DAY FROM (s.trial_ends_at - NOW())) as days_remaining
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'trialing';

-- Verificar assinatura de um usuário específico
SELECT 
    u.email,
    s.plan,
    s.status,
    s.started_at,
    s.expires_at,
    CASE 
        WHEN s.expires_at IS NULL THEN true
        WHEN s.expires_at > NOW() THEN true
        ELSE false
    END as is_active
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE u.email = 'usuario@email.com';

-- Contar usuários por plano
SELECT 
    COALESCE(s.plan, 'free') as plan,
    COUNT(*) as total
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
GROUP BY s.plan;

-- =====================================================
-- 6. FUNÇÃO PARA VERIFICAR SE USUÁRIO É PREMIUM
-- =====================================================

CREATE OR REPLACE FUNCTION is_premium_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.subscriptions 
        WHERE user_id = check_user_id
        AND status = 'active'
        AND (plan = 'premium' OR plan = 'trial')
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar a função
-- SELECT is_premium_user('UUID_DO_USUARIO');

-- =====================================================
-- 7. TRIGGER PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at_trigger ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at_trigger
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- =====================================================
-- FINALIZADO
-- =====================================================
-- Como usar:
-- 1. Execute as seções 1 (criar tabela)
-- 2. Use seção 2 para tornar usuário premium
-- 3. Use as queries úteis para verificar
