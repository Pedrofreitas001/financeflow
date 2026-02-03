# 🔑 Como Encontrar suas Credenciais no Supabase

## Passo 1: Abra seu Projeto

1. Entre em https://app.supabase.com
2. Clique no seu projeto: `bdcabccstxhivlzmpbxw`
3. No menu esquerdo, vá para **Settings** (⚙️)
4. Clique em **API**

## Passo 2: Copie as Credenciais

### VITE_SUPABASE_URL
- Já está no `.env`: `https://bdcabccstxhivlzmpbxw.supabase.co`

### VITE_SUPABASE_ANON_KEY
Na página de **API Settings**, você verá:

```
Project API keys:
├── Public key (anon, public)
└── Secret key (service_role)
```

📌 **IMPORTANTE**: Use a **Public key (anon, public)**, NÃO a Secret key!

1. Procure pela seção **"Public key (anon, public)"**
2. Clique no ícone de copiar 📋
3. Cole no `.env` no lugar de:
   ```
   VITE_SUPABASE_ANON_KEY=COLE_AQUI
   ```

## Passo 3: Salve o Arquivo

Seu `.env` deve ficar assim:
```env
VITE_SUPABASE_URL=https://bdcabccstxhivlzmpbxw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

## ⚠️ Segurança

- ✅ Use a **Public key (anon)** para o frontend
- ❌ NUNCA use a **Secret key** no frontend
- ❌ NUNCA commite o `.env` no Git

## Passo 4: Reinicie o Dev Server

```bash
npm run dev
```

A página deve carregar agora! 🚀

## Testar

1. Acesse http://localhost:3000
2. Você deve ver a landing page
3. Clique em "Login" para testar autenticação
