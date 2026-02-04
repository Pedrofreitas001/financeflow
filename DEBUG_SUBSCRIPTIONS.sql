-- ====================================
-- DEBUG: Verificar Subscriptions
-- ====================================
-- Copie e cole este SQL no Supabase SQL Editor

-- 1. Ver TODOS os usuários e suas subscriptions
SELECT 
  u.id,
  u.email,
  COALESCE(s.plan, 'FREE (sem registro)') as plan,
  COALESCE(s.status, '-') as status,
  COALESCE(s.created_at, '-') as created_at,
  COALESCE(s.expires_at, 'Nunca') as expires_at
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC;

-- ====================================
-- 2. Ver somente Diamond users
-- ====================================
SELECT 
  u.id,
  u.email,
  s.plan,
  s.status,
  s.created_at,
  s.expires_at
FROM auth.users u
INNER JOIN public.subscriptions s ON u.id = s.user_id
WHERE s.plan = 'diamond'
ORDER BY s.created_at DESC;

-- ====================================
-- 3. Contar quantos users há de cada plan
-- ====================================
SELECT 
  plan,
  COUNT(*) as quantidade
FROM public.subscriptions
GROUP BY plan
ORDER BY quantidade DESC;

-- ====================================
-- 4. Verificar RLS Policies
-- ====================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'subscriptions'
ORDER BY policyname;

-- ====================================
-- 5. Se você sabe seu user_id, busque direto:
-- ====================================
-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo seu UUID
SELECT * FROM public.subscriptions 
WHERE user_id = 'SEU_USER_ID_AQUI';

-- ====================================
-- 6. Atualizar plan para diamond (ADMIN)
-- ====================================
-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo seu UUID
UPDATE public.subscriptions 
SET plan = 'diamond', status = 'active'
WHERE user_id = 'SEU_USER_ID_AQUI';

-- Verificar que foi atualizado:
SELECT * FROM public.subscriptions 
WHERE user_id = 'SEU_USER_ID_AQUI';

-- ====================================
-- 7. Se não tiver subscription, criar uma
-- ====================================
-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo seu UUID
INSERT INTO public.subscriptions (user_id, plan, status)
VALUES ('SEU_USER_ID_AQUI', 'diamond', 'active');

-- Verificar:
SELECT * FROM public.subscriptions 
WHERE user_id = 'SEU_USER_ID_AQUI';
