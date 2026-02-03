# 🚀 Guia Rápido - Supabase Setup

## Passo 1: Instalar Dependência

```bash
npm install
```

Isso vai instalar `@supabase/supabase-js` que foi adicionado ao package.json

## Passo 2: Configurar Variáveis de Ambiente

1. Copie `.env.example` para `.env`
2. Abra seu projeto no Supabase
3. Vá para **Settings > API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

Seu `.env` deve ficar assim:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

## Passo 3: Executar SQL no Supabase

1. Abra seu projeto no Supabase
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Cole todo o conteúdo de `SUPABASE_SQL_SETUP.sql`
5. Clique em **Run**

> ✅ Isso vai criar:
> - Tabelas: `profiles`, `user_data`, `audit_log`
> - Políticas RLS
> - Buckets de Storage
> - Funções e Triggers

## Passo 4: Verificar Setup

### No Supabase Dashboard:
1. **Table Editor** - Veja as tabelas criadas
2. **Storage** - Veja os buckets `avatars` e `user-files`
3. **Authentication** - Configure os provedores (Email/Google)

## Passo 5: Testar no App

```bash
npm run dev
```

Acesse `http://localhost:3001` e teste:
- Crie uma conta em `/login`
- Faça login
- Você será redirecionado para `/dashboard`

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/supabase.ts` | Cliente Supabase |
| `src/context/AuthContext.tsx` | Contexto de autenticação |
| `src/ProtectedRoute.tsx` | Componente para proteger rotas |
| `src/utils/supabaseUtils.ts` | Funções utilitárias (upload) |
| `.env.example` | Template de variáveis |
| `SUPABASE_SQL_SETUP.sql` | SQL para Supabase |

## Usando no Componente

```typescript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div>
      <p>Olá, {user?.email}</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
};
```

## Upload de Arquivos

```typescript
import { uploadExcelFile } from '../utils/supabaseUtils';

const handleUpload = async (file: File) => {
  try {
    const data = await uploadExcelFile(file);
    console.log('Arquivo salvo:', data);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

## Troubleshooting

### ❌ "Missing Supabase credentials"
- Verificar `.env` existe e tem valores corretos
- Reiniciar o dev server

### ❌ "User not authenticated"
- Faça login em `/login` primeiro
- Limpe cache/cookies do navegador

### ❌ Erro de RLS
- Executar SQL novamente
- Verificar se as políticas foram criadas em Settings > Security

## 📚 Documentação
- [Supabase Docs](https://supabase.com/docs)
- [Auth Reference](https://supabase.com/docs/reference/javascript/auth-signup)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---
✅ Setup completo e pronto para uso!
