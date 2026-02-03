# 🔧 Como Desabilitar Confirmação de Email no Supabase

## Passo a Passo

1. **Acesse seu projeto no Supabase**: https://app.supabase.com

2. **Vá para Authentication**:
   - No menu lateral, clique em **Authentication**
   - Clique em **Providers**

3. **Configure Email Provider**:
   - Encontre **Email** na lista de providers
   - Clique para expandir as configurações
   - **DESMARQUE** a opção: ✅ **"Confirm email"**
   - Clique em **Save**

4. **Pronto!** Agora os usuários podem:
   - Criar conta sem precisar confirmar email
   - Fazer login imediatamente após o cadastro

## Screenshot das Configurações

```
Authentication > Providers > Email

[ ] Confirm email          ← DESMARQUE ISSO
[x] Secure email change
[ ] Enable sign ups
```

## Teste

Depois de desabilitar:
1. Acesse: http://localhost:3001/login
2. Clique em "Cadastrar"
3. Preencha o formulário
4. Clique em "Cadastrar"
5. Você será **redirecionado automaticamente** para o dashboard!

✅ Sem necessidade de verificar email!
