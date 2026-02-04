# 🔧 Como Executar o Setup Completo do Supabase

## ⚠️ PROBLEMA
```
ERROR 42P01: relation "public.subscriptions" does not exist
```

## ✅ SOLUÇÃO

### PASSO 1: Copiar Script Completo

Abra o arquivo: `SUPABASE_COMPLETE_SETUP.sql`

Copie **TODO** o conteúdo (Ctrl+A → Ctrl+C)

### PASSO 2: Ir para Supabase

1. Acesse: https://app.supabase.com
2. Clique no seu projeto
3. Menu esquerdo → **SQL Editor**
4. Clique **"New Query"**

### PASSO 3: Colar e Executar

1. Cole o script completo (Ctrl+V)
2. Clique **"RUN"** (botão azul) ou Ctrl+Enter

### PASSO 4: Verificar Resultado

Você verá:
```
table_name
subscriptions
data_versions
google_sheets_connections
ai_insights
```

✅ Se aparecer essas 4 tabelas = **SUCESSO!**

---

## 🎯 Próximo Passo: Tornar Usuário Premium

Após executar o setup acima, copie este comando (troque seu email):

```sql
INSERT INTO public.subscriptions (user_id, plan, status, started_at, expires_at)
SELECT 
    id, 
    'premium', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
FROM auth.users
WHERE email = 'SEU-EMAIL@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    plan = 'premium',
    status = 'active',
    expires_at = NOW() + INTERVAL '1 year',
    updated_at = NOW();
```

---

## ❌ Se der erro novamente?

**Erro: `relation "auth.users" does not exist`**
- Isso NÃO deve acontecer (auth.users é nativa do Supabase)
- Verifique se você está no projeto correto

**Erro: `permission denied`**
- Verifique suas permissões no Supabase (Role settings)

**Erro: `syntax error`**
- Copie de novo todo o arquivo (pode ter faltado algo)

---

## ✨ O Que Foi Criado?

| Tabela | Função |
|--------|--------|
| **subscriptions** | Gerenciar planos (free, premium, trial) |
| **data_versions** | Histórico de Excel/Google Sheets |
| **google_sheets_connections** | Conexões OAuth com Google |
| **ai_insights** | Análises geradas pela IA |

---

## 🔐 Segurança Ativada

✅ Row Level Security (RLS)
✅ Políticas por usuário
✅ Criptografia de tokens
✅ Isolamento de dados

---

Após executar, teste tornar seu usuário premium e faça refresh da página! 🚀
