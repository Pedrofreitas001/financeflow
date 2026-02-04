# ✅ Integração: Inserir Dados + Salvar no Excel

## 📊 Estrutura Final

**Dois botões separados:**
1. **Inserir Dados** → Abre modal (Manual ou Google Sheets)
2. **Salvar no Excel** → Exporta dados carregados

**Modal simplificado:**
- Apenas pergunta: Manual ou Google Sheets?
- Sem ícones nos botões
- Sem debug no código

## 🎯 Passo a Passo de Integração

### 1️⃣ Em DashboardDespesas.tsx (ou outro dashboard)

```typescript
import DataUploadModal from '@/components/DataUploadModal';
import { InsertDataButton, SaveExcelButton } from '@/components/DataUploadButtons';
import { exportToExcel, importFromExcel } from '@/utils/excelUtils';
import { saveDataToHistory } from '@/utils/dataHistoryManager';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function DashboardDespesas() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loadedData, setLoadedData] = useState<any[] | null>(null);
  const { readSpreadsheet, isSignedIn, signIn } = useGoogleSheets();

  // ✅ Botão 1: Inserir Dados (abre modal)
  const handleInsertData = () => {
    setShowUploadModal(true);
  };

  // ✅ Botão 2: Salvar no Excel (exporta)
  const handleSaveExcel = async (data: any[]) => {
    try {
      await exportToExcel(data, {
        filename: 'despesas',
        sheetName: 'Despesas',
      });
    } catch (error) {
      alert('Erro ao salvar arquivo');
    }
  };

  // ✅ Modal: Upload Manual
  const handleManualUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const result = await importFromExcel(file);
        setLoadedData(result.firstSheet);

        // 💾 Salvar no histórico
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveDataToHistory(
            user.id,
            'despesas',
            'manual',
            result.filename,
            result.rowCount,
            result.columns
          );
        }

        alert('Dados carregados com sucesso!');
      };
      input.click();
    } catch (error) {
      alert('Erro ao importar arquivo');
    }
  };

  // ✅ Modal: Google Sheets (IMPLEMENTADO)
  const handleGoogleSheets = async () => {
    try {
      const spreadsheetId = prompt(
        'Cole o ID ou URL da planilha Google Sheets:\n\nExemplo: 1mHIWnDvW9cABJiKK_JV-XxWJz5J5w_iUvZ3Z5Z5Z5Z\nou\nhttps://docs.google.com/spreadsheets/d/1ABC.../edit'
      );
      
      if (!spreadsheetId) return;

      // Extrair ID da URL se necessário
      const id = spreadsheetId.includes('/d/')
        ? spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || spreadsheetId
        : spreadsheetId;

      // Autenticar se necessário
      if (!isSignedIn) {
        const success = await signIn();
        if (!success) {
          alert('Erro ao autenticar com Google');
          return;
        }
      }

      // Ler dados da planilha
      const result = await readSpreadsheet(id, 'Sheet1');

      // Converter para array de objetos
      const data = result.values.map((row: any[]) => {
        const obj: any = {};
        result.columns.forEach((col: string, index: number) => {
          obj[col] = row[index] || '';
        });
        return obj;
      });

      setLoadedData(data);

      // 💾 Salvar no histórico
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await saveDataToHistory(
          user.id,
          'despesas',
          'google_sheets',
          `Google Sheets: ${id}`,
          result.rowCount,
          result.columns
        );
      }

      alert(`✅ ${result.rowCount} linhas carregadas com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao conectar Google Sheets:', error);
      alert(`Erro: ${error.message || 'Erro ao conectar Google Sheets'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Botões de ação */}
      <div className="flex gap-3">
        <InsertDataButton onInsertData={handleInsertData} />
        <SaveExcelButton onSaveExcel={handleSaveExcel} data={loadedData} />
      </div>

      {/* ✅ Modal estilo PremiumModal */}
      <DataUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        dashboardType="despesas"
        onManualUpload={handleManualUpload}
        onGoogleSheets={handleGoogleSheets}
      />

      {/* ✅ Resto da dashboard... */}
    </div>
  );
}
```

## 🔧 Componentes Criados

### ✅ DataUploadModal.tsx (ATUALIZADO)
- Simples e direto
- 2 botões: Upload Manual | Google Sheets
- Sem ícones
- Sem confirmação com stats
- Sem salvamento de histórico (feito no handler)

### ✅ DataUploadButtons.tsx (NOVO)
```typescript
<InsertDataButton onInsertData={() => setShowUploadModal(true)} />
<SaveExcelButton onSaveExcel={handleSave} data={data} />
```

### ✅ excelUtils.ts (NOVO)
```typescript
await exportToExcel(data, { filename: 'despesas' });
const result = await importFromExcel(file);
```

### ✅ DataHistoryViewer.tsx (ATUALIZADO)
- Removido ícones (📊 → "Upload Manual")
- Limpo e simples
- Integra em Settings tab

## 📝 Fluxo Completo

```
┌─────────────────────────────────────┐
│  DashboardDespesas                  │
│  ┌─────────────────────────────────┐│
│  │ [Inserir Dados] [Salvar Excel]  ││
│  └─────────────────────────────────┘│
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
[Modal Simples]    [exportToExcel]
  ├─ Manual          ├─ .xlsx
  └─ Google Sheets   └─ download
    │
    ▼
[importFromExcel]
    │
    ▼
[saveDataToHistory]
    │
    ▼
[Histórico no Settings]
```

## 🛠️ Implementação Rápida

1. **Copy-paste** o código de `DashboardDespesas` acima
2. **Repita** para outras dashboards (DRE, CashFlow, etc)
3. **Teste**:
   - Clicar "Inserir Dados" → Modal abre
   - Escolher "Upload Manual"
   - Selecionar arquivo .xlsx
   - Ver confirmação
   - Ver em Settings/Histórico
4. **Repita** para Google Sheets (após setup do GOOGLE_SHEETS_SETUP.md)

## ✅ Status da Implementação

| Item | Status | Local |
|------|--------|-------|
| Modal | ✅ Pronto | `components/DataUploadModal.tsx` |
| Botões | ✅ Pronto | `components/DataUploadButtons.tsx` |
| Excel Utils | ✅ Pronto | `utils/excelUtils.ts` |
| Histórico | ✅ Pronto | `components/Settings/DataHistoryViewer.tsx` |
| Debug Removido | ✅ Feito | `DashboardApp.tsx` |
| Google Sheets | ⏳ Setup | `GOOGLE_SHEETS_SETUP.md` |

## 📚 Arquivos de Referência

- `GOOGLE_SHEETS_SETUP.md` - Setup completo de Google Sheets
- `SISTEMA_HISTORICO_DADOS.md` - Documentação do histórico
- `utils/dataHistoryManager.ts` - Core do sistema de histórico
- `utils/excelUtils.ts` - Funções de Excel

## 🎉 Próximos Passos

1. ✅ Integrar em DashboardDespesas
2. ✅ Testar Upload Manual
3. ⏳ Setup Google Sheets (veja GOOGLE_SHEETS_SETUP.md)
4. ⏳ Integrar Google Sheets
5. ⏳ Repetir em outras dashboards
