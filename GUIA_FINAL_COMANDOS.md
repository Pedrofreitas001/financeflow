# 📋 GUIA FINAL DE COMANDOS

## 🎯 SETUP COMPLETO DO PROJETO

### 1️⃣ PREPARAÇÃO DO SUPABASE

```bash
# 1. Copie o SQL completo de GUIA_FINAL_SUPABASE.md
# 2. Vá para https://app.supabase.com
# 3. SQL Editor → New Query → Cole e execute
# 4. Aguarde "✓ Success"
```

### 2️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE

```bash
# Arquivo: .env (raiz do projeto)
# Adicione estas linhas:

VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

VITE_GOOGLE_CLIENT_ID=871875585142-ujc539mrh923o404ajltkf47186a8eu5.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_API_KEY=AQ.Ab8RN6IcqJE29WWqSJRwL3i2-uzfmxvFTNuAcA3_mntMNUcHxA

VITE_GEMINI_API_KEY=AIzaSyBJC5Hjv6L3hgnwsv3LfK1-hfjO7vMyPig
```

### 3️⃣ INSTALAR DEPENDÊNCIAS

```bash
# Instalar todas as dependências
npm install

# Se necessário, instale tipos específicos
npm install --save-dev @types/file-saver
npm install supabase @supabase/supabase-js
npm install @google/generative-ai
```

### 4️⃣ INICIAR SERVIDOR DE DESENVOLVIMENTO

```bash
# Rodar em modo desenvolvimento (hot reload)
npm run dev

# Abrirá em: http://localhost:3002/
# (ou 3000, 3001 se 3002 estiver em uso)
```

---

## 🔧 COMANDOS DE DESENVOLVIMENTO

### Verificar erros de compilação

```bash
# Ver todos os erros TypeScript
npm run type-check

# Ou simplesmente ao salvar arquivo (automático com Vite)
```

### Build para produção

```bash
# Compilar para produção
npm run build

# Preview da build de produção localmente
npm run preview
```

### Linter/Formatação

```bash
# Se usando ESLint
npm run lint

# Se usando Prettier (se instalado)
npm run format
```

---

## 🚀 FLUXO DE INTEGRAÇÃO

### A. Integrar DataInputSelector nos Dashboards

1. **Abra cada arquivo de dashboard**:
   ```
   components/DashboardDespesas.tsx
   components/Orcamento/DashboardOrcamento.tsx
   components/Balancete/DashboardBalancete.tsx
   components/CashFlow/DashboardCashFlow.tsx
   ```

2. **Adicione imports no topo**:
   ```typescript
   import DataInputSelector from '@/components/DataInputSelector';
   import { useUserPlan } from '@/hooks/useUserPlan';
   import { useUsageLimits } from '@/hooks/useUsageLimits';
   import LimitReachedModal from '@/components/LimitReachedModal';
   ```

3. **Adicione estado**:
   ```typescript
   const [showSelector, setShowSelector] = useState(false);
   const [showLimitModal, setShowLimitModal] = useState(false);
   const { user } = useAuthContext();
   const { plan } = useUserPlan(user?.id);
   const { canUploadExcel, excelUploads, excelUploadsLimit } = useUsageLimits(user?.id, plan);
   ```

4. **Adicione botão + modais no JSX**:
   ```typescript
   <button onClick={() => {
     if (!canUploadExcel) {
       setShowLimitModal(true);
     } else {
       setShowSelector(true);
     }
   }}>
     📊 Inserir Dados
   </button>

   <DataInputSelector
     isOpen={showSelector}
     onClose={() => setShowSelector(false)}
     userPlan={plan}
     onSelectManual={() => {/* handle manual excel */}}
     onSelectGoogleSheets={() => {/* handle google sheets */}}
   />

   <LimitReachedModal
     isOpen={showLimitModal}
     onClose={() => setShowLimitModal(false)}
     featureName="Excel Upload"
     currentPlan={plan}
     used={excelUploads}
     limit={excelUploadsLimit}
     onUpgrade={() => window.location.href = '/pricing'}
   />
   ```

### B. Integrar DataHistoryTab + InsightsManager em Settings

1. **Abra**: `components/Settings/DashboardSettings.tsx`

2. **Adicione imports**:
   ```typescript
   import DataHistoryTab from '@/components/Settings/DataHistoryTab';
   import InsightsManager from '@/components/Settings/InsightsManager';
   ```

3. **Adicione estado de abas**:
   ```typescript
   const [activeTab, setActiveTab] = useState('general');
   const [selectedDashboard, setSelectedDashboard] = useState('despesas');
   ```

4. **Renderize 3 abas**:
   ```typescript
   <div className="flex gap-4 border-b">
     <button onClick={() => setActiveTab('general')}>⚙️ General</button>
     <button onClick={() => setActiveTab('history')}>📂 Data History</button>
     <button onClick={() => setActiveTab('insights')}>💡 Insights</button>
   </div>

   {activeTab === 'general' && <GeneralSettings />}
   {activeTab === 'history' && <DataHistoryTab userId={user?.id!} dashboardType={selectedDashboard} />}
   {activeTab === 'insights' && <InsightsManager userId={user?.id!} dashboardType={selectedDashboard} />}
   ```

### C. Adicionar "Salvar Insight" no AIChat

1. **Abra**: `components/AIChat.tsx`

2. **Adicione import**:
   ```typescript
   import { saveAIInsight, estimateTokensUsed } from '@/utils/aiInsightsManager';
   ```

3. **Adicione função**:
   ```typescript
   async function handleSaveAsInsight(analysisText: string) {
     const tokens = estimateTokensUsed(analysisText);
     await saveAIInsight(
       user?.id!,
       'despesas', // seu dashboardType
       'manual_insight',
       { title: 'Insight', content: analysisText },
       tokens,
       0.95
     );
     alert('Salvo!');
   }
   ```

4. **Adicione botão no chat**:
   ```typescript
   <button onClick={() => handleSaveAsInsight(messageText)}>
     💾 Salvar como Insight
   </button>
   ```

---

## 📦 ESTRUTURA PRONTA

### Hooks criados (use quando necessário):

```typescript
import { useUserPlan } from '@/hooks/useUserPlan';
// Retorna: { plan, isPremium, isDiamond, expiresAt, daysRemaining }

import { useUsageLimits } from '@/hooks/useUsageLimits';
// Retorna: { excelUploads, aiAnalyses, canUploadExcel, canAnalyzeAI, ... }
```

### Utils criados:

```typescript
import { uploadExcelFile, getExcelHistory, deleteExcelUpload } from '@/utils/excelUploadManager';
// Gerencia Excel com auto-cleanup (3 últimos)

import { saveAIInsight, getAIInsights, deleteAIInsight } from '@/utils/aiInsightsManager';
// Salva e gerencia insights de IA

import { logUsage, canPerformAction, getUsageStatus } from '@/utils/usageTracker';
// Rastreia uso e verifica limites por plano
```

### Componentes criados:

```typescript
import DataInputSelector from '@/components/DataInputSelector';
// Modal: Escolhe Manual Excel ou Google Sheets

import DataHistoryTab from '@/components/Settings/DataHistoryTab';
// Aba: Últimos 3 Excel + Google Sheets status

import InsightsManager from '@/components/Settings/InsightsManager';
// Aba: Gerencia insights (delete)

import LimitReachedModal from '@/components/LimitReachedModal';
// Modal: Paywall quando limite atingido
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] SQL executado no Supabase (**CRÍTICO**)
- [ ] `.env` com variáveis de Supabase
- [ ] `lib/supabase.ts` existe e importa client
- [ ] `npm install` rodou com sucesso
- [ ] `npm run dev` inicia sem erros
- [ ] DataInputSelector integrado em todos os dashboards
- [ ] DataHistoryTab integrada em Settings
- [ ] InsightsManager integrada em Settings
- [ ] Botão "Salvar Insight" em AIChat
- [ ] Testado: upload Excel → histórico → delete
- [ ] Testado: limite de uso → paywall
- [ ] Testado: salvar insight → aparecer em Settings

---

## 🧪 TESTES RÁPIDOS

### Teste 1: Upload Excel
```
1. Vai para Dashboard > Inserir Dados
2. Escolhe Manual Excel
3. Seleciona arquivo
4. Arquivo aparece em Settings > Data History
5. Clica delete e confirma
```

### Teste 2: Limite de Uso
```
1. Faz 1 upload (user é free)
2. Tenta fazer 2º upload
3. Modal "Limite Atingido" aparece
```

### Teste 3: Insight
```
1. Abre AIChat
2. Faz pergunta
3. Clica "Salvar como Insight"
4. Vai em Settings > Saved Insights
5. Insight aparece com delete button
```

---

## 🚨 PROBLEMAS COMUNS

### "Cannot find module @/lib/supabase"
**Solução**: Certifique-se que `lib/supabase.ts` existe na raiz

### "Missing environment variables"
**Solução**: Verifique `.env` tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### "RLS policy error in Supabase"
**Solução**: Verifique que todas as 7 tabelas têm RLS ativada (deve estar pronto no SQL)

### "Port 3000/3001/3002 in use"
**Solução**: Vite automaticamente usa a próxima porta disponível. Verifique o output do `npm run dev`

---

## 📝 PRÓXIMAS ETAPAS

1. **Hoje**: 
   - [ ] Executar SQL no Supabase
   - [ ] Configurar `.env`
   - [ ] Rodar `npm install` e `npm run dev`

2. **Amanhã**: 
   - [ ] Integrar DataInputSelector em 1 dashboard
   - [ ] Testar upload Excel
   - [ ] Integrar History tab em Settings

3. **Dia 3**: 
   - [ ] Integrar InsightsManager
   - [ ] Adicionar botão Save em AIChat
   - [ ] Teste completo

4. **Deploy**:
   - [ ] `git add .`
   - [ ] `git commit -m "feat: Freemium architecture v1"`
   - [ ] `git push origin main`
   - [ ] Vercel auto-deploy

---

**Versão**: 1.0 | **Data**: Feb 3, 2026 | **Status**: ✅ Pronto para implementação
