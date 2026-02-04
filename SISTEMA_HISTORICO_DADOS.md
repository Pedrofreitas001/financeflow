# ✅ Sistema de Histórico de Dados & Upload Modal

## 🎯 O Que Foi Implementado

### 1. **Sistema de Histórico Completo** (`utils/dataHistoryManager.ts`)
- ✅ Salva dados com origem (manual ou Google Sheets)
- ✅ Rastreia timestamp, linhas, colunas
- ✅ Integra com Supabase tabela `excel_uploads`
- ✅ Funções: salvar, buscar, deletar, obter estatísticas

### 2. **Modal de Upload** (`components/DataUploadModal.tsx`)
- ✅ Apresenta 2 opções: Manual ou Google Sheets
- ✅ Mostra dados carregados (linhas, colunas, origem)
- ✅ Botão "Salvar no Histórico"
- ✅ Feedback visual com emojis

### 3. **Visualizador de Histórico** (`components/Settings/DataHistoryViewer.tsx`)
- ✅ Mostra lista de uploads com origem
- ✅ Discrimina: Manual, Google Sheets, API
- ✅ Mostra data/hora, linhas, colunas
- ✅ Botão para deletar entrada

## 📊 Estrutura da Tabela Supabase

```sql
-- excel_uploads table
id                  UUID        PRIMARY KEY
user_id             UUID        FK to auth.users
dashboard_type      TEXT        (dashboard, despesas, dre, etc)
source              TEXT        (manual, google_sheets, api)
file_name           TEXT        Original file name
row_count           INTEGER     Number of rows
columns             JSONB       Array of column names
file_size           INTEGER     Size in bytes
metadata            JSONB       Extra info (JSON)
created_at          TIMESTAMP   Auto
updated_at          TIMESTAMP   Auto
```

## 🔧 Como Usar

### 1. **Integrar Modal em um Dashboard**

```typescript
import DataUploadModal from '@/components/DataUploadModal';
import { useState } from 'react';

export default function MyDashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loadedData, setLoadedData] = useState(null);

  return (
    <>
      <button onClick={() => setShowUploadModal(true)}>
        📊 Carregar Dados
      </button>

      <DataUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        dashboardType="despesas"
        onManualUpload={() => {
          // Seu código de upload manual aqui
          // Depois: setLoadedData({ rowCount: 100, columns: [...], source: 'manual' })
        }}
        onGoogleSheets={() => {
          // Seu código de Google Sheets aqui
          // Depois: setLoadedData({ rowCount: 200, columns: [...], source: 'google_sheets' })
        }}
        loadedData={loadedData}
        onSaveHistory={(entryId) => {
          console.log('Salvo com ID:', entryId);
          setShowUploadModal(false);
          setLoadedData(null);
        }}
      />
    </>
  );
}
```

### 2. **Integrar Histórico na Aba Settings**

```typescript
import DataHistoryViewer from '@/components/Settings/DataHistoryViewer';

export default function SettingsTab() {
  return (
    <div>
      <h3>📋 Histórico de Dados</h3>
      <DataHistoryViewer />
    </div>
  );
}
```

### 3. **Usar o Manager Diretamente**

```typescript
import { saveDataToHistory, getDataHistory } from '@/utils/dataHistoryManager';

// Salvar dados
const result = await saveDataToHistory(
  userId,
  'despesas',        // dashboard_type
  'manual',          // source
  'despesas.xlsx',   // fileName
  150,               // rowCount
  ['Data', 'Valor', 'Categoria'], // columns
);

if (result.success) {
  console.log('Salvo com ID:', result.id);
}

// Buscar histórico
const history = await getDataHistory(userId, 'despesas');
```

## 🔄 Fluxo Completo

```
Usuário clica "Carregar Dados"
    ↓
Modal abre com 2 opções
    ↓
Usuário escolhe Manual ou Google Sheets
    ↓
Dados são carregados
    ↓
Modal mostra: Linhas, Colunas, Origem
    ↓
Usuário clica "Salvar no Histórico"
    ↓
Sistema salva em Supabase (excel_uploads)
    ↓
✅ Confirmação: "Dados salvos no histórico"
    ↓
Na aba de Histórico (Settings), aparece a entrada nova
```

## 📝 Campos do Histórico

Para cada entrada de upload, é salvo:
- **dashboard_type**: Qual dashboard (despesas, dre, etc)
- **source**: Origem (manual ou google_sheets)
- **row_count**: Quantas linhas foram importadas
- **columns**: Array com nomes das colunas
- **file_name**: Nome original do arquivo
- **created_at**: Data/hora do upload
- **metadata**: JSON com info extra (tamanho, hash, etc)

## 🎯 Origem dos Dados (Discriminação)

### Manual (📊)
- Usuário faz upload via arquivo Excel
- Salvado uma única vez
- Não atualiza automaticamente

### Google Sheets (🔗)
- Conexão com Google Sheets
- Atualização automática quando sheet muda
- Rastreado em `google_sheets_connections`

### API (⚙️)
- Dados vindos via integração
- Pode ser automático ou manual

## 💾 Deletar do Histórico

```typescript
import { deleteHistoryEntry } from '@/utils/dataHistoryManager';

await deleteHistoryEntry(entryId);
// Remove entrada do Supabase
```

## 📊 Obter Estatísticas

```typescript
import { getUploadStats } from '@/utils/dataHistoryManager';

const stats = await getUploadStats(userId);
console.log(stats);
// {
//   total: 15,
//   by_source: { manual: 10, google_sheets: 5, api: 0 },
//   by_type: { despesas: 5, dre: 3, dashboard: 7, ... }
// }
```

## 🔐 Segurança

- ✅ RLS no Supabase garante que cada usuário vê apenas seus uploads
- ✅ Política: `Users can view their own excel_uploads`
- ✅ user_id é preenchido automaticamente do token

## 🚀 Próximos Passos

1. **Implementar Upload de Arquivo**
   - Receber arquivo .xlsx
   - Parsear com XLSX library
   - Mostrar preview das linhas

2. **Integrar Google Sheets**
   - Conexão OAuth
   - Ler sheet via API
   - Setup de refresh automático

3. **Validação de Dados**
   - Verificar formato das colunas
   - Alertar se houver erros
   - Permitir correção antes de salvar

4. **Mapeamento de Colunas**
   - Permitir usuário mapear colunas customizadas
   - Salvar mapeamento no histórico
   - Reusar para próximos uploads

## ✅ Checklist de Implementação

- [x] Criar `dataHistoryManager.ts`
- [x] Criar `DataUploadModal.tsx`
- [x] Criar `DataHistoryViewer.tsx`
- [ ] Implementar Upload de Arquivo
- [ ] Implementar Google Sheets
- [ ] Adicionar validação de dados
- [ ] Integrar em DashboardDespesas
- [ ] Integrar em outras dashboards
- [ ] Adicionar na aba Settings

## 🐛 Troubleshooting

### "Usuário não autenticado"
- Certifique-se que o usuário está logado
- Verifique se o token do Supabase é válido

### "Erro ao salvar histórico"
- Verifique as políticas RLS
- Confira se a tabela `excel_uploads` existe
- Verifique se as colunas correspondem

### "Histórico vazio"
- Verificar se há dados na tabela
- Confirmar que `user_id` está correto
- Tentar fazer um novo upload

---

**Status**: ✅ Pronto para integração com upload de arquivo e Google Sheets
