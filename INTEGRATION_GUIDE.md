# 🔧 Frontend Integration Guide

## Overview
This document explains how to integrate all the new components and utilities into the existing app.

## Components Created

### 1. DataInputSelector Modal ✅
**File**: `components/DataInputSelector.tsx`
**Purpose**: Ask user "Manual Excel" or "Google Sheets" when entering dashboard

**Integration Points**:
- Import into each dashboard page: `components/DashboardDespesas.tsx`, `components/Orcamento/DashboardOrcamento.tsx`, etc.
- Show modal when user clicks "Inserir Dados" button WITHIN the dashboard
- Each dashboard type uses own `dashboardType` identifier

**Example**:
```typescript
import DataInputSelector from '@/components/DataInputSelector';
import { useUserPlan } from '@/hooks/useUserPlan';

export function DataPreparation() {
  const { user } = useAuthContext();
  const { plan } = useUserPlan(user?.id);
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <button onClick={() => setShowSelector(true)}>
        Insert Data
      </button>
      
      <DataInputSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        userPlan={plan}
        onSelectManual={() => {
          // Show Excel uploader
        }}
        onSelectGoogleSheets={() => {
          // Show Google Sheets auth
        }}
      />
    </>
  );
}
```

### 2. DataHistoryTab Component ✅
**File**: `components/Settings/DataHistoryTab.tsx`
**Purpose**: Show last 3 Excel uploads + Google Sheets status

**Integration Points**:
- Add as tab in `components/Settings/DashboardSettings.tsx`
- Pass `userId` and `dashboardType` props

**Example**:
```typescript
import DataHistoryTab from '@/components/Settings/DataHistoryTab';

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <div>
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('general')}
          className={activeTab === 'general' ? 'active' : ''}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history' ? 'active' : ''}
        >
          Data History
        </button>
      </div>
      
      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'history' && (
        <DataHistoryTab 
          userId={user.id} 
          dashboardType="despesas"
        />
      )}
    </div>
  );
}
```

### 3. LimitReachedModal Component ✅
**File**: `components/LimitReachedModal.tsx`
**Purpose**: Show paywall when user hits monthly limits

**Integration Points**:
- Import and use before any major action (upload, analyze, export)

**Example**:
```typescript
import LimitReachedModal from '@/components/LimitReachedModal';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export function Dashboard() {
  const { user } = useAuthContext();
  const { plan } = useUserPlan(user?.id);
  const { canUploadExcel, excelUploads, excelUploadsLimit } = useUsageLimits(user?.id, plan);
  const [showLimitModal, setShowLimitModal] = useState(false);

  async function handleUploadExcel(file: File) {
    if (!canUploadExcel) {
      setShowLimitModal(true);
      return;
    }
    
    // Do upload
  }

  return (
    <>
      <button onClick={(e) => {
        const file = getFileFromInput(e);
        handleUploadExcel(file);
      }}>
        Upload Excel
      </button>
      
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureName="Excel Upload"
        currentPlan={plan}
        used={excelUploads}
        limit={excelUploadsLimit}
        onUpgrade={() => {
          // Navigate to pricing page or show upgrade modal
        }}
      />
    </>
  );
}
```

## Hooks Created

### 1. useUserPlan ✅
**File**: `hooks/useUserPlan.ts`
**Returns**: `{ plan, isPremium, isDiamond, expiresAt, daysRemaining }`

**Usage**:
```typescript
import { useUserPlan } from '@/hooks/useUserPlan';

export function MyComponent() {
  const { user } = useAuthContext();
  const { plan, isPremium, daysRemaining } = useUserPlan(user?.id);

  if (!isPremium) return <UpsellComponent />;
  
  return (
    <div>
      Your plan: {plan}
      Days left: {daysRemaining}
    </div>
  );
}
```

### 2. useUsageLimits ✅
**File**: `hooks/useUsageLimits.ts`
**Returns**: `{ excelUploads, excelUploadsLimit, aiAnalyses, aiAnalysesLimit, ... }`

**Usage**:
```typescript
import { useUsageLimits } from '@/hooks/useUsageLimits';

export function Dashboard() {
  const { user } = useAuthContext();
  const { plan } = useUserPlan(user?.id);
  const { 
    excelUploads, excelUploadsLimit, canUploadExcel,
    aiAnalyses, aiAnalysesLimit, canAnalyzeAI
  } = useUsageLimits(user?.id, plan);

  return (
    <div>
      <p>Uploads this month: {excelUploads} / {excelUploadsLimit}</p>
      {!canUploadExcel && <p>⚠️ Limit reached!</p>}
    </div>
  );
}
```

## Utilities Created

### 1. excelUploadManager ✅
**File**: `utils/excelUploadManager.ts`

**Functions**:
- `uploadExcelFile(userId, file, dashboardType)` → `{ success, message, fileId }`
- `getExcelHistory(userId, dashboardType)` → `ExcelUpload[]`
- `reuploadExcelFromHistory(userId, fileId)` → `{ success, data }`
- `deleteExcelUpload(userId, fileId)` → `boolean`

**Example**:
```typescript
import { uploadExcelFile, getExcelHistory } from '@/utils/excelUploadManager';

async function handleFileUpload(file: File) {
  const result = await uploadExcelFile(userId, file, 'despesas');
  
  if (result.success) {
    alert(result.message);
    // File saved and logged in usage_logs
  } else {
    alert(result.message); // Duplicate or error
  }
}

async function showHistory() {
  const history = await getExcelHistory(userId, 'despesas');
  console.log(`Last 3 uploads:`, history);
}
```

### 2. aiInsightsManager ✅
**File**: `utils/aiInsightsManager.ts`

**Functions**:
- `saveAIInsight(userId, dashboardType, analysisType, insights, tokensUsed, confidenceScore)`
- `getAIInsights(userId, dashboardType?, limit)`
- `getTotalTokensUsed(userId, monthOffset)`
- `estimateTokensUsed(text)` → `number`

**Example**:
```typescript
import { saveAIInsight, estimateTokensUsed } from '@/utils/aiInsightsManager';

async function handleAIAnalysis() {
  const analysisText = "Found 3 expense trends...";
  const tokens = estimateTokensUsed(analysisText);
  
  const result = await saveAIInsight(
    userId,
    'despesas',
    'trends',
    { trends: [...] },
    tokens,
    0.92 // confidence
  );
  
  if (result.success) {
    console.log('Analysis saved:', result.id);
  }
}
```

### 3. usageTracker ✅
**File**: `utils/usageTracker.ts`

**Functions**:
- `logUsage(userId, actionType, metadata)` → `boolean`
- `canPerformAction(userId, actionType, plan)` → `boolean`
- `getUsageStatus(userId, plan)` → `Record<action, { used, limit, canUse }>`

**Example**:
```typescript
import { canPerformAction, logUsage } from '@/utils/usageTracker';

async function uploadFile() {
  const canUpload = await canPerformAction(userId, 'excel_upload', plan);
  
  if (!canUpload) {
    showLimitReachedModal();
    return;
  }
  
  // Do upload
  await uploadExcelFile(...);
  
  // Log the action
  await logUsage(userId, 'excel_upload', { file_size: 1024 });
}
```

## Step-by-Step Integration

### Step 1: Add DataInputSelector to Each Dashboard
Add "Inserir Dados" button with DataInputSelector modal to each dashboard component:

```typescript
// components/DashboardDespesas.tsx
import DataInputSelector from '@/components/DataInputSelector';
import { useUserPlan } from '@/hooks/useUserPlan';
import { uploadExcelFile } from '@/utils/excelUploadManager';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import LimitReachedModal from '@/components/LimitReachedModal';

export function DashboardDespesas() {
  const { user } = useAuthContext();
  const { plan } = useUserPlan(user?.id);
  const { canUploadExcel, excelUploads, excelUploadsLimit } = useUsageLimits(user?.id, plan);
  const [showSelector, setShowSelector] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  function handleInsertData() {
    if (!canUploadExcel) {
      setShowLimitModal(true);
      return;
    }
    setShowSelector(true);
  }

  return (
    <div>
      {/* Existing dashboard content */}
      
      <button 
        onClick={handleInsertData}
        className="btn btn-primary"
      >
        📊 Inserir Dados
      </button>

      <DataInputSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        userPlan={plan}
        onSelectManual={() => {
          setShowSelector(false);
          // Show file picker
        }}
        onSelectGoogleSheets={() => {
          setShowSelector(false);
          // Show Google Sheets auth
        }}
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
    </div>
  );
}
```

**Repeat for**: `DashboardOrcamento`, `DashboardBalancete`, etc. (each dashboard has its own `dashboardType`)

### Step 2: Update Settings Page - Add Two Tabs
Add tabs for Data History and Insights Manager:

```typescript
// components/Settings/DashboardSettings.tsx
import DataHistoryTab from '@/components/Settings/DataHistoryTab';
import InsightsManager from '@/components/Settings/InsightsManager'; // NEW

export function DashboardSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuthContext();
  const [selectedDashboard, setSelectedDashboard] = useState('despesas');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-3 ${activeTab === 'general' ? 'border-b-2 border-emerald-500' : ''}`}
        >
          ⚙️ General Settings
        </button>
        <button 
          onClick={() => setActiveTab('data-history')}
          className={`pb-3 ${activeTab === 'data-history' ? 'border-b-2 border-emerald-500' : ''}`}
        >
          📂 Data History
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`pb-3 ${activeTab === 'insights' ? 'border-b-2 border-emerald-500' : ''}`}
        >
          💡 Saved Insights
        </button>
      </div>

      {activeTab === 'general' && <GeneralSettings />}
      
      {activeTab === 'data-history' && (
        <DataHistoryTab 
          userId={user?.id!} 
          dashboardType={selectedDashboard}
        />
      )}

      {activeTab === 'insights' && (
        <InsightsManager
          userId={user?.id!}
          dashboardType={selectedDashboard}
        />
      )}
    </div>
  );
}
```

### Step 3: Update AIChat Component
**DO NOT** save individual chat messages. Only save **insights** (analysis results) when user explicitly creates an insight:

```typescript
// components/AIChat.tsx
import { saveAIInsight, estimateTokensUsed } from '@/utils/aiInsightsManager';
import { canPerformAction } from '@/utils/usageTracker';

export function AIChat() {
  const { user } = useAuthContext();
  const { plan } = useUserPlan(user?.id);

  // Regular chat messages are NOT saved to Supabase
  async function handleChatMessage(message: string) {
    const response = await analyzeWithGemini(message);
    addMessageToChat(response);
    // ✅ This is just a conversation, don't save to DB
  }

  // Only save when user clicks "Save as Insight"
  async function handleSaveInsight(analysisText: string) {
    // Check limit first
    const canAnalyze = await canPerformAction(user?.id!, 'ai_analysis', plan);
    if (!canAnalyze) {
      showLimitModal();
      return;
    }

    const tokens = estimateTokensUsed(analysisText);

    // Save ONLY the final insight (not the chat history)
    await saveAIInsight(
      user?.id!,
      'despesas',
      'manual_insight', // analysis type
      { 
        title: extractTitle(analysisText),
        content: analysisText,
        savedAt: new Date() 
      },
      tokens,
      0.95
    );

    alert('Insight salvo com sucesso!');
  }
}
```

### Step 4: Add Usage Checks Before Actions
Wrap major actions with usage checks:

```typescript
import LimitReachedModal from '@/components/LimitReachedModal';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export function Dashboard() {
  const { user } = useAuthContext();
  const { plan } = useUserPlan(user?.id);
  const { 
    canUploadExcel, excelUploads, excelUploadsLimit,
    canAnalyzeAI, aiAnalyses, aiAnalysesLimit 
  } = useUsageLimits(user?.id, plan);
  
  const [showLimitModal, setShowLimitModal] = useState<{
    feature: string;
    used: number;
    limit: number;
  } | null>(null);

  function handleUploadClick() {
    if (!canUploadExcel) {
      setShowLimitModal({
        feature: 'Excel Upload',
        used: excelUploads,
        limit: excelUploadsLimit
      });
      return;
    }
    // Show file picker
  }

  function handleAnalyzeClick() {
    if (!canAnalyzeAI) {
      setShowLimitModal({
        feature: 'Análise com IA',
        used: aiAnalyses,
        limit: aiAnalysesLimit
      });
      return;
    }
    // Do analysis
  }

  return (
    <>
      <button onClick={handleUploadClick}>Upload Excel</button>
      <button onClick={handleAnalyzeClick}>Analyze with AI</button>

      {showLimitModal && (
        <LimitReachedModal
          isOpen={true}
          onClose={() => setShowLimitModal(null)}
          featureName={showLimitModal.feature}
          currentPlan={plan}
          used={showLimitModal.used}
          limit={showLimitModal.limit}
          onUpgrade={() => {
            // Navigate to pricing or show upgrade modal
            window.location.href = '/pricing';
          }}
        />
      )}
    </>
  );
}
```

## Testing Checklist

- [ ] SQL schema executed in Supabase (CRITICAL)
- [ ] DataInputSelector shows when clicking "Insert Data"
- [ ] Can select Manual Excel (all users)
- [ ] Google Sheets option disabled for Free users with paywall
- [ ] Excel file uploads and appears in Settings > Data History
- [ ] Can re-upload from history
- [ ] Can delete from history
- [ ] Free user limited to 1 upload/month
- [ ] Premium user can do 10 uploads/month
- [ ] Diamond user unlimited
- [ ] Limit modal shows when limit reached
- [ ] AI analysis saved with tokens
- [ ] Usage stats update monthly

## Deployment

After testing:

1. `git add .`
2. `git commit -m "feat: Freemium architecture with versioning"`
3. `git push origin main`
4. Vercel automatically deploys
5. Check function logs for any issues

---

**Status**: All components created ✅ | Ready for integration
**Next**: Execute SQL + integrate components into pages
