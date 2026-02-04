# 🚀 Google Sheets Integration - Setup Completo

## PASSO 1: Google Cloud Console Setup

### 1.1 Criar Projeto
1. Acesse: https://console.cloud.google.com
2. Clique em "Create Project" ou selecione projeto existente
3. Nome do projeto: `FinanceFlow Dashboard`

### 1.2 Ativar APIs Necessárias
1. No menu esquerdo, acesse "APIs & Services" → "Library"
2. Procure e ative:
   - **Google Sheets API**
   - **Google Drive API**
   - **Google People API**

### 1.3 Criar Credenciais OAuth 2.0
1. Acesse "APIs & Services" → "Credentials"
2. Clique "Create Credentials" → "OAuth 2.0 Client IDs"
3. Se solicitado, primeiro configure a "OAuth consent screen":
   - User Type: External
   - Preencha informações básicas
   - Adicione seu email em "Test users"

### 1.4 Configurar OAuth Client
1. Application type: **Web Application**
2. Nome: `FinanceFlow Dashboard`
3. Authorized redirect URIs:
   ```
   http://localhost:5173/auth/callback
   https://seu-dominio.vercel.app/auth/callback
   ```
4. Clique "Create" e copie:
   - **Client ID**
   - **Client Secret**

### 1.5 Criar API Key (para leitura pública)
1. Em "Credentials" clique "Create Credentials" → "API Key"
2. Copie a chave

## PASSO 2: Atualizar Variáveis de Ambiente

No arquivo `.env`:
```bash
VITE_GOOGLE_CLIENT_ID=seu-client-id-aqui
VITE_GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
VITE_GOOGLE_API_KEY=sua-api-key-aqui
```

No Vercel (Production):
- Acesse Settings → Environment Variables
- Adicione as mesmas 3 variáveis

## PASSO 3: Executar SQL no Supabase

1. Acesse Supabase Dashboard → seu projeto → SQL Editor
2. Crie nova query
3. Copie e cole todo o conteúdo de `SUPABASE_GOOGLE_SHEETS_SETUP.sql`
4. Clique "Run"

## PASSO 4: Integrar no Componente

No arquivo `landing/pages/DataPreparation.tsx`:
```tsx
import GoogleSheetConnector from '@/components/GoogleSheetConnector';

export default function DataPreparation() {
  const user = ... // get authenticated user

  return (
    <div>
      {/* ... resto do componente */}
      
      <div className="mt-8">
        <GoogleSheetConnector 
          userId={user.id}
          onConnected={() => {
            console.log('Google Sheet conectado!');
            // Recarregar dados
          }}
        />
      </div>
    </div>
  );
}
```

## PASSO 5: Adicionar Route de Callback

No `App.tsx` ou seu router:
```tsx
import GoogleSheetsAuth from '@/landing/pages/GoogleSheetsAuth';

<Route path="/auth/callback" element={<GoogleSheetsAuth />} />
```

## FLUXO DE USO

1. **Usuário conecta Google**: Clica "Conectar com Google" → OAuth flow
2. **Seleciona planilha**: Cola URL + nome da aba + range
3. **Define sincronização**: Intervalo (60-3600 segundos)
4. **Dados carregam automaticamente**: A cada X segundos
5. **Histórico de versões**: Todos os dados salvos com versionamento

## 📊 VERSIONAMENTO AUTOMÁTICO

Cada sincronização gera uma nova versão se houver mudanças:
- ✅ Detecção de hash (evita versões duplicadas)
- ✅ Cálculo de diferenças (linhas adicionadas/modificadas)
- ✅ Rastreamento de histórico completo
- ✅ Possibilidade de reverter para versão anterior

## ⚡ SINCRONIZAÇÃO EM TEMPO REAL

Intervalo recomendado por caso de uso:
- **60-120s**: Dados críticos, mudanças frequentes
- **300-600s**: Dados normais, sincronização moderada
- **1800-3600s**: Dados estáticos, baixa frequência

## 🔐 SEGURANÇA

- ✅ Tokens armazenados criptografados no Supabase
- ✅ Client Secret nunca exposto ao frontend (backend only)
- ✅ RLS policies garantem isolamento por usuário
- ✅ Refresh tokens gerenciados automaticamente
- ✅ .env protegido no .gitignore

## ❌ TROUBLESHOOTING

### "Erro 403: Permission Denied"
- Verifique se o usuário Google tem acesso à planilha
- Confirme que as APIs estão ativadas

### "Token Expirado"
- Sistema tenta refresh automaticamente
- Se falhar, reconecte a conta Google

### "Planilha Vazia"
- Verifique o range (A1:Z1000)
- Confirme que há dados na primeira linha (headers)

## 📝 PRÓXIMOS PASSOS

1. ✅ Implementado: OAuth2 + Syncronização
2. ⏳ Próximo: Webhook em tempo real (Google Sheets)
3. ⏳ Futuro: Histórico visual de mudanças
4. ⏳ Futuro: Merge de versões conflitantes
