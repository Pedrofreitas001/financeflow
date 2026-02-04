# Configuração do Google OAuth 2.0

## Erro: "IdentityCredentialError: Error retrieving a token"

Este erro ocorre quando o Google Cloud Console não está configurado corretamente para permitir autenticação OAuth.

## Solução: Configurar Origens Autorizadas no Google Cloud Console

### Passo 1: Acessar o Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Selecione seu projeto (ou crie um novo)

### Passo 2: Configurar Tela de Consentimento OAuth
1. Vá para: **APIs & Services** → **OAuth consent screen**
2. Tipo de Usuário: **External** (ou Internal se for G Suite)
3. Preencha:
   - Nome do aplicativo
   - Email de suporte
   - Domínios autorizados (opcional)
4. Escopos: Adicione os seguintes escopos:
   - `https://www.googleapis.com/auth/spreadsheets.readonly`
   - `https://www.googleapis.com/auth/drive.readonly`
5. Salve e continue

### Passo 3: Configurar Credenciais OAuth 2.0
1. Vá para: **APIs & Services** → **Credentials**
2. Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Tipo: **Web application**
4. Nome: `FinanceFlow Dashboard`

### Passo 4: ADICIONAR ORIGENS JAVASCRIPT AUTORIZADAS ⚠️ IMPORTANTE
Na seção **Authorized JavaScript origins**, adicione:

```
http://localhost:3003
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://127.0.0.1:3003
http://127.0.0.1:3000
```

E também adicione seu domínio de produção (se tiver):
```
https://seu-dominio.com
https://www.seu-dominio.com
```

### Passo 5: ADICIONAR URIs DE REDIRECIONAMENTO AUTORIZADAS
Na seção **Authorized redirect URIs**, adicione:

```
http://localhost:3003
http://localhost:3000
http://127.0.0.1:3003
```

### Passo 6: Salvar e Obter Credenciais
1. Clique em **CREATE**
2. Copie o **Client ID** e **Client Secret**
3. Adicione no arquivo `.env`:

```env
VITE_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
VITE_GOOGLE_API_KEY=sua-api-key-aqui
```

### Passo 7: Habilitar APIs Necessárias
Vá para **APIs & Services** → **Library** e habilite:
1. **Google Sheets API**
2. **Google Drive API**

### Passo 8: Reiniciar o Servidor
Depois de fazer essas configurações:
1. Pare o servidor (`Ctrl+C`)
2. Limpe o cache: `rm -rf node_modules/.vite`
3. Reinicie: `npm run dev`
4. Limpe cookies/cache do navegador ou teste em aba anônima

## Verificação

Após configurar, teste:
1. Abra o app
2. Clique em "Inserir Dados" → "Google Sheets"
3. O popup deve abrir sem erros
4. Selecione sua conta Google
5. Conceda permissões

## Troubleshooting

### Erro persiste?
- Verifique se o Client ID no `.env` é exatamente o mesmo do Google Cloud Console
- Certifique-se de que as origens autorizadas incluem a porta correta (`3003`)
- Aguarde alguns minutos - as configurações do Google podem levar até 5 minutos para propagar
- Limpe completamente o cache do navegador

### Popup não abre?
- Verifique bloqueadores de popup no navegador
- Tente em modo anônimo/incógnito
- Verifique console do navegador (F12) para erros

### "Access blocked: This app's request is invalid"?
- A tela de consentimento OAuth não foi configurada
- Volte ao Passo 2 e configure corretamente
