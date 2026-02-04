# 🐛 Debug - Plan Status Não Reconhece Diamond

## ✅ O que foi melhorado:

1. **Logging aprimorado** no `useUserPlan.ts`:
   - Agora mostra mensagens de erro mais detalhadas
   - Exibe code de erro do Supabase
   - Logs estruturados com prefixo `[useUserPlan]`

2. **Widget de Debug melhorado** em `DebugPlanStatus.tsx`:
   - Executa apenas UMA VEZ ao montar (evita loops)
   - Aguarda 1 segundo antes de executar (para ter certeza que está autenticado)
   - Usa `maybeSingle()` em vez de `select('*')` (mais eficiente)
   - Mostra cores diferentes para diferentes tipos de mensagens:
     - 🟢 Verde: sucesso (✓)
     - 🔴 Vermelho: erro (❌)
     - 🟡 Amarelo: aguardando (⏳)
     - 🟠 Laranja: aviso (⚠)
     - 🔵 Azul: secção (===)

## 🔍 Como Debugar:

### Passo 1: Abrir a App
```bash
npm run dev
# Abrir http://localhost:3003
```

### Passo 2: Procurar pelo Widget Debug
- Deve aparecer no **canto inferior direito** da tela
- Ícone: 🐛 Debug Plan Status
- É uma caixa preta com texto em cores

### Passo 3: Ler os Logs

**Você deve ver uma sequência assim:**

```
=== INICIANDO DEBUG ===
✓ Usuário autenticado: seu_email@example.com
  ID: abc123de...

Buscando subscription no banco de dados...
  Status HTTP: 200
✓ Subscription encontrada:
  Plan: diamond
  Status: active
  Created: 03/02/2026
  Expires: Nunca

=== ESTADO DO HOOK ===
Plan: diamond
isPremium: false
isDiamond: true
Status: active
Loading: false
```

## ❌ Se Vir um Erro:

### Erro: "❌ Erro ao pegar usuário"
- **Causa**: Você não está autenticado
- **Solução**: Faça login primeiro

### Erro: "⏳ Aguardando autenticação do usuário..."
- **Causa**: Pode ser delay na verificação
- **Solução**: Clique no botão "Atualizar" no widget

### Erro: "❌ Erro na query: 42501"
- **Causa**: RLS (Row Level Security) - você não tem permissão
- **Solução**: Verifique as políticas de RLS do Supabase

### Erro: "⚠ Nenhuma subscription encontrada (free user)"
- **Causa**: Seu usuário não tem subscription no banco
- **Solução**: Execute o SQL para criar subscription

### Aviso: "⚠️ AVISO: Hook plan não corresponde ao DB!"
- **Causa**: O banco está com um plan diferente do que o hook retorna
- **Solução**: Pode ser delay de atualização - recarregue a página

## 📋 Verificar Diretamente no Supabase

1. Vá ao **Supabase Dashboard**
2. Clique em **SQL Editor**
3. Execute este SQL:

```sql
SELECT 
  u.email,
  s.plan,
  s.status,
  s.created_at,
  s.expires_at
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE u.email = 'seu_email@example.com';
```

Substitua `seu_email@example.com` pelo seu email real.

### Resultado esperado para Diamond:
```
email          | plan    | status | created_at       | expires_at
seu@email.com  | diamond | active | 2024-01-15T10... | null
```

## 🔧 Se a Subscription Não Existe:

Execute este SQL para criar/atualizar:

```sql
-- Se não existir, inserir
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT id, 'diamond', 'active'
FROM auth.users
WHERE email = 'seu_email@example.com'
AND id NOT IN (SELECT user_id FROM public.subscriptions);

-- Se já existir, atualizar
UPDATE public.subscriptions
SET plan = 'diamond', status = 'active'
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email = 'seu_email@example.com'
);
```

## 🔄 Forçar Atualização da App

Depois de atualizar no Supabase:

1. Clique "Atualizar" no widget debug
2. Ou recarregue a página: F5 / Ctrl+R
3. Ou feche e abra novamente

## 📊 Estado Esperado por Plano:

### Free User:
```
Plan: free
isPremium: false
isDiamond: false
Status: active
```

### Premium User:
```
Plan: premium
isPremium: true
isDiamond: false
Status: active
```

### Diamond User:
```
Plan: diamond
isPremium: false
isDiamond: true
Status: active
```

## 🎯 Próximos Passos:

1. Abra a app e procure pelo widget debug
2. Compartilhe o conteúdo dos logs comigo
3. Vamos diagnosticar exatamente o que está acontecendo

Se vir um erro específico, mande a mensagem completa que aparece no widget debug!
