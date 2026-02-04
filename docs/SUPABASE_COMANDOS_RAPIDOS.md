# 📚 Comandos Supabase - Guia Prático

## 📊 Tabelas Criadas

1. **subscriptions** - Gerenciar planos (free, premium, trial)
2. **data_versions** - Histórico de versões de dados (Excel, Google Sheets)
3. **google_sheets_connections** - Conexões com Google Sheets
4. **ai_insights** - Insights gerados pela IA
5. **auth.users** - Usuários do Supabase (nativa)
6. **profiles** - Perfil do usuário (nativa)

---

## 🚀 COMANDOS RÁPIDOS

### 1️⃣ VER TODOS OS USUÁRIOS

```sql
SELECT id, email, created_at FROM auth.users;
```

**Resultado esperado:**
```
id                                    email              created_at
123e4567-e89b-12d3-a456-426614174000  joao@email.com     2024-01-15
```

---

### 2️⃣ TORNAR USUÁRIO PREMIUM (por EMAIL)

**Copie, cole e adapte:**

```sql
INSERT INTO public.subscriptions (user_id, plan, status, started_at, expires_at)
SELECT 
    id, 
    'premium', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
FROM auth.users
WHERE email = 'joao@email.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    plan = 'premium',
    status = 'active',
    expires_at = NOW() + INTERVAL '1 year',
    updated_at = NOW();
```

**Alterar para seu email! ⬆️**

---

### 3️⃣ DAR TRIAL DE 7 DIAS

```sql
INSERT INTO public.subscriptions (user_id, plan, status, started_at, trial_ends_at)
SELECT 
    id, 
    'trial', 
    'trialing',
    NOW(),
    NOW() + INTERVAL '7 days'
FROM auth.users
WHERE email = 'joao@email.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    plan = 'trial',
    status = 'trialing',
    trial_ends_at = NOW() + INTERVAL '7 days',
    updated_at = NOW();
```

---

### 4️⃣ VER PLANO DO USUÁRIO

```sql
SELECT 
    u.email,
    s.plan,
    s.status,
    s.started_at,
    s.expires_at
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'joao@email.com';
```

**Resultado esperado:**
```
email          plan      status   started_at           expires_at
joao@email.com premium   active   2024-01-15 10:00:00  2025-01-15 10:00:00
```

---

### 5️⃣ VER TODOS OS USUÁRIOS PREMIUM

```sql
SELECT 
    u.email,
    s.plan,
    s.status,
    s.expires_at
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.plan = 'premium' AND s.status = 'active';
```

---

### 6️⃣ CANCELAR PREMIUM (VOLTA PARA FREE)

```sql
UPDATE public.subscriptions
SET 
    plan = 'free',
    status = 'canceled',
    expires_at = NOW(),
    updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'joao@email.com'
);
```

---

### 7️⃣ VER HISTÓRICO DE VERSÕES DE UM USUÁRIO

```sql
SELECT 
    version_number,
    file_name,
    data_type,
    row_count,
    file_size,
    created_at,
    notes
FROM data_versions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'joao@email.com')
ORDER BY created_at DESC
LIMIT 10;
```

---

### 8️⃣ VER CONEXÕES GOOGLE SHEETS

```sql
SELECT 
    spreadsheet_name,
    sheet_names,
    is_active,
    last_sync,
    sync_interval_seconds
FROM google_sheets_connections
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'joao@email.com');
```

---

### 9️⃣ CONTAR USUÁRIOS POR PLANO

```sql
SELECT 
    COALESCE(s.plan, 'free') as plan,
    s.status,
    COUNT(*) as total
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
GROUP BY s.plan, s.status
ORDER BY total DESC;
```

---

### 🔟 DELETAR USUÁRIO COMPLETAMENTE

```sql
DELETE FROM auth.users
WHERE email = 'joao@email.com';
```

⚠️ **CUIDADO!** Isso deleta tudo relacionado ao usuário (cascata)

---

## 🎯 FLUXO TÍPICO

### Cenário: Novo usuário que quer testar premium

**Passo 1: Verificar usuário existe**
```sql
SELECT id, email FROM auth.users WHERE email = 'novo@email.com';
```

**Passo 2: Tornar premium por 7 dias (trial)**
```sql
INSERT INTO public.subscriptions (user_id, plan, status, started_at, trial_ends_at)
SELECT 
    id, 
    'trial', 
    'trialing',
    NOW(),
    NOW() + INTERVAL '7 days'
FROM auth.users
WHERE email = 'novo@email.com'
ON CONFLICT (user_id) DO UPDATE SET plan = 'trial', status = 'trialing', trial_ends_at = NOW() + INTERVAL '7 days';
```

**Passo 3: Verificar se funcionou**
```sql
SELECT u.email, s.plan, s.status, s.trial_ends_at 
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'novo@email.com';
```

---

## 📈 QUERIES ÚTEIS

### Usuários com trial expirando em 1 dia
```sql
SELECT 
    u.email,
    s.trial_ends_at,
    EXTRACT(DAY FROM (s.trial_ends_at - NOW())) as days_remaining
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'trialing' 
AND s.trial_ends_at < NOW() + INTERVAL '1 day'
AND s.trial_ends_at > NOW();
```

### Premium que está expirando
```sql
SELECT 
    u.email,
    s.expires_at,
    EXTRACT(DAY FROM (s.expires_at - NOW())) as days_remaining
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.plan = 'premium'
AND s.expires_at < NOW() + INTERVAL '7 days'
AND s.expires_at > NOW();
```

---

## ⚡ DICA RÁPIDA

**Copie esta função no SQL Editor para verificar rapidamente se um usuário é premium:**

```sql
SELECT is_premium_user((SELECT id FROM auth.users WHERE email = 'joao@email.com')) as is_premium;
```

**Resultado:**
```
is_premium
true (ou false)
```

---

## 🔐 LEMBRETE DE SEGURANÇA

- ✅ **Nunca compartilhe** dados de usuários
- ✅ **Use email** nos comandos (mais fácil que UUID)
- ✅ **Sempre faça SELECT primeiro** antes de DELETE/UPDATE
- ✅ **Tokens** estão criptografados no Supabase
- ✅ **RLS policies** protegem dados de cada usuário

---

## 📝 PASSO-A-PASSO: Tornar seu email Premium

1. Abra Supabase Dashboard → seu projeto → SQL Editor
2. Cole este comando (troque o email!):

```sql
INSERT INTO public.subscriptions (user_id, plan, status, started_at, expires_at)
SELECT 
    id, 
    'premium', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
FROM auth.users
WHERE email = 'SEU-EMAIL-AQUI@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    plan = 'premium',
    status = 'active',
    expires_at = NOW() + INTERVAL '1 year',
    updated_at = NOW();
```

3. Clique **RUN**
4. Verá: `Query successful`
5. Faça refresh da aplicação
6. Seu usuário agora é PREMIUM! 🎉

---

**Pronto pra testar?** 🚀
