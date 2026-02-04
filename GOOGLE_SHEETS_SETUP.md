# 🔗 Configurar Google Sheets Integration

## 📋 Resumo

O sistema permite carregar dados de Google Sheets com 2 opções:
1. **Inserir Dados** - Modal com opção de Upload Manual ou Google Sheets
2. **Salvar no Excel** - Exportar dados para arquivo Excel

## 🔑 Passo 1: Criar Credenciais Google Cloud

### 1.1 Acessar Google Cloud Console
1. Ir para [Google Cloud Console](https://console.cloud.google.com)
2. Criar novo projeto ou selecionar existente
3. Nomear projeto: `Dashboard SaaS` ou similar

### 1.2 Habilitar Google Sheets API
1. Na barra de busca, procurar por **"Google Sheets API"**
2. Clicar em **Enable**
3. Aguardar ativação (pode levar 1-2 minutos)

### 1.3 Criar OAuth 2.0 Credentials
1. No menu lateral, ir para **Credentials**
2. Clicar **Create Credentials** → **OAuth client ID**
3. Selecionar **Web application**
4. Adicionar URIs autorizadas:
   - `http://localhost:3003` (desenvolvimento)
   - `http://localhost:5173` (Vite default)
   - Sua URL de produção (ex: `https://seudominio.com`)
5. Clicar **Create**
6. Copiar **Client ID** e guardar (vamos usar em `.env`)

### 1.4 Criar Service Account (Opcional - para backend)
1. Em **Credentials**, clicar **Create Credentials** → **Service Account**
2. Preencher detalhes
3. Clicar **Create and Continue**
4. Em **Keys**, clicar **Add Key** → **Create new key** → **JSON**
5. Arquivo JSON será baixado - guardar em lugar seguro

## 🌍 Passo 2: Configurar Variáveis de Ambiente

No arquivo `.env`:

```env
# Google OAuth 2.0
VITE_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
VITE_GOOGLE_DISCOVERY_DOCS=https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest
VITE_GOOGLE_SCOPES=https://www.googleapis.com/auth/spreadsheets.readonly
```

### ⚠️ Atenção: Use `VITE_` para variáveis públicas

Apenas `VITE_` e `PUBLIC_` são expostas ao frontend. Variáveis sem prefixo são privadas!

## 📦 Passo 3: Instalar Bibliotecas

```bash
npm install @react-oauth/google axios
npm install --save-dev @types/gapi @types/gapi.sheets
```

## 💻 Passo 4: Implementar Hook de Google Sheets

Criar arquivo `hooks/useGoogleSheets.ts`:

```typescript
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export function useGoogleSheets() {
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Carregar Google API
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            discoveryDocs: [import.meta.env.VITE_GOOGLE_DISCOVERY_DOCS],
            scope: import.meta.env.VITE_GOOGLE_SCOPES,
          });
          setGoogleLoaded(true);
        } catch (error) {
          console.error('Erro ao inicializar Google API:', error);
        }
      });
    };
    document.body.appendChild(script);
  }, []);

  const readSpreadsheet = async (spreadsheetId: string, range: string) => {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.result.values;
    } catch (error) {
      console.error('Erro ao ler spreadsheet:', error);
      throw error;
    }
  };

  return { googleLoaded, readSpreadsheet };
}
```

## 🎨 Passo 5: Usar em DashboardDespesas

```typescript
import DataUploadModal from '@/components/DataUploadModal';
import { useState } from 'react';

export default function DashboardDespesas() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleManualUpload = async () => {
    // Implementar seleção de arquivo Excel
    console.log('Upload Manual clicked');
  };

  const handleGoogleSheets = async () => {
    // Implementar conexão com Google Sheets
    const sheetId = prompt('Cole o ID da planilha Google Sheets:');
    if (!sheetId) return;

    try {
      const rows = await readSpreadsheet(sheetId, 'Sheet1');
      // Processar dados...
    } catch (error) {
      alert('Erro ao ler planilha');
    }
  };

  return (
    <>
      {/* Botão de Inserir Dados */}
      <button onClick={() => setShowUploadModal(true)}>
        Inserir Dados
      </button>

      {/* Botão de Salvar no Excel */}
      <button onClick={() => saveToExcel()}>
        Salvar no Excel
      </button>

      {/* Modal */}
      <DataUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        dashboardType="despesas"
        onManualUpload={handleManualUpload}
        onGoogleSheets={handleGoogleSheets}
      />
    </>
  );
}
```

## 🔐 Passo 6: Segurança

### Públicas (Frontend OK)
```env
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_DISCOVERY_DOCS=...
VITE_GOOGLE_SCOPES=...
```

### Privadas (Backend apenas)
```env
GOOGLE_SERVICE_ACCOUNT_KEY=... (JSON)
SUPABASE_SERVICE_KEY=...
```

⚠️ **Nunca coloque no `.env` públicoprivate keys ou tokens sensíveis!**

## 📊 Passo 7: Estrutura de Dados Esperada

Google Sheets deve ter format:
- Primeira linha: Cabeçalhos (colunas)
- Próximas linhas: Dados

Exemplo:
```
| Data       | Categoria  | Valor  |
|------------|-----------|--------|
| 01/01/2025 | Aluguel    | 2000   |
| 01/01/2025 | Energia    | 500    |
```

## ✅ Checklist

- [ ] Google Cloud Project criado
- [ ] Google Sheets API habilitada
- [ ] OAuth credentials criado
- [ ] `.env` configurado com `VITE_GOOGLE_CLIENT_ID`
- [ ] Bibliotecas instaladas (`@react-oauth/google`, `axios`)
- [ ] Hook `useGoogleSheets.ts` criado
- [ ] DashboardDespesas integrado com modal
- [ ] Testado: Upload Manual funciona
- [ ] Testado: Google Sheets conexão funciona
- [ ] Dados salvos no histórico

## 🧪 Teste Rápido

1. Abrir app em http://localhost:3003
2. Clicar **Inserir Dados**
3. Escolher **Google Sheets**
4. Colar ID de uma planilha publica de teste
5. Verificar se dados carregam corretamente

## 🐛 Troubleshooting

### Erro: "Unauthorized to access spreadsheet"
- Verificar se Client ID está correto em `.env`
- Confirmar que planilha é pública ou compartilhada com a conta Google
- Verificar escopos em `VITE_GOOGLE_SCOPES`

### Erro: "Spreadsheet ID not found"
- Verificar ID da planilha (está na URL após `/d/`)
- Ex: `docs.google.com/spreadsheets/d/1mHIWnDvW9cABJiKK_JV-XxWJz5J5w_iUvZ3Z5Z5Z5Z/edit`
- ID é: `1mHIWnDvW9cABJiKK_JV-XxWJz5J5w_iUvZ3Z5Z5Z5Z`

### Erro: "gapi is not defined"
- Verificar se script Google API carregou
- Verificar console do navegador por erros de CORS
- Verificar se URL está autorizada em Google Cloud

## 📚 Referências

- [Google Sheets API](https://developers.google.com/sheets/api)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)

---

**Status**: Setup pronto para implementação
