-- ============================================
-- AUTOMAÇÃO: Atualizar dados quando plano muda
-- ============================================

-- Este script cria triggers e funções para preencher
-- automaticamente os dados quando há mudança de plano

-- 1. Função para atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger para atualizar updated_at quando houver mudança
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- 3. Função para notificar quando plano muda (para real-time)
CREATE OR REPLACE FUNCTION public.notify_plan_changed()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.plan IS DISTINCT FROM NEW.plan THEN
        PERFORM pg_notify(
            'subscription_changed',
            json_build_object(
                'user_id', NEW.user_id,
                'old_plan', OLD.plan,
                'new_plan', NEW.plan,
                'changed_at', CURRENT_TIMESTAMP
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para notificar mudanças
DROP TRIGGER IF EXISTS notify_plan_changed ON public.subscriptions;
CREATE TRIGGER notify_plan_changed
    AFTER UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_plan_changed();

-- ============================================
-- Verificar estrutura atual da tabela
-- ============================================
-- Execute este SQL para ver quais colunas existem:
/*
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
*/

-- ============================================
-- Se precisar ADICIONAR colunas que faltam:
-- ============================================

-- Adicionar coluna updated_at se não existir
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Adicionar coluna expires_at se não existir (para futuro)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna reason se não existir (por que o plano mudou)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS reason TEXT;

-- ============================================
-- Atualizar registros existentes com updated_at
-- ============================================
UPDATE public.subscriptions
SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

-- ============================================
-- FUNÇÃO: Mudar plano de um usuário automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.update_user_plan(
    p_user_id UUID,
    p_new_plan TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_old_plan TEXT;
    v_result JSON;
BEGIN
    -- Buscar plano atual
    SELECT plan INTO v_old_plan
    FROM public.subscriptions
    WHERE user_id = p_user_id;

    IF v_old_plan IS NULL THEN
        -- Criar nova subscription se não existir
        INSERT INTO public.subscriptions (user_id, plan, status, reason)
        VALUES (p_user_id, p_new_plan, 'active', p_reason);
        
        v_result := json_build_object(
            'success', true,
            'message', 'Subscription criada',
            'user_id', p_user_id,
            'old_plan', 'none',
            'new_plan', p_new_plan
        );
    ELSE
        -- Atualizar subscription existente
        UPDATE public.subscriptions
        SET plan = p_new_plan,
            status = 'active',
            reason = p_reason,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
        
        v_result := json_build_object(
            'success', true,
            'message', 'Subscription atualizada',
            'user_id', p_user_id,
            'old_plan', v_old_plan,
            'new_plan', p_new_plan,
            'reason', p_reason
        );
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMO USAR A FUNÇÃO:
-- ============================================
-- Mudar um usuário para premium:
-- SELECT public.update_user_plan('user-uuid-aqui', 'premium', 'Upgrade via Stripe');

-- Mudar um usuário para diamond:
-- SELECT public.update_user_plan('user-uuid-aqui', 'diamond', 'VIP subscription');

-- Voltar para free:
-- SELECT public.update_user_plan('user-uuid-aqui', 'free', 'Cancelamento');

-- ============================================
-- VIEW: Últimas mudanças de plano
-- ============================================
CREATE OR REPLACE VIEW public.subscription_changes AS
SELECT 
    user_id,
    plan,
    status,
    reason,
    created_at,
    updated_at,
    (SELECT email FROM auth.users WHERE id = subscriptions.user_id) as user_email
FROM public.subscriptions
ORDER BY updated_at DESC;

-- Query para ver:
-- SELECT * FROM public.subscription_changes LIMIT 10;

-- ============================================
-- VERIFICAR TUDO FUNCIONANDO:
-- ============================================
/*
-- 1. Ver todas as subscriptions
SELECT * FROM public.subscriptions;

-- 2. Ver a view de mudanças
SELECT * FROM public.subscription_changes;

-- 3. Ver triggers criados
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'subscriptions';

-- 4. Ver funções criadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%subscription%';
*/
