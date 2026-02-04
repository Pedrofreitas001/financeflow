<!-- IMPORTANT: Execute Supabase Schema NOW -->

# ⚠️ CRITICAL: Supabase Database Setup Required

## Status: Schema Created ✅ | Database Updated ❌

The SQL schema has been created in `SUPABASE_COMPLETE_SETUP.sql` but **NOT YET executed in your Supabase database**.

## Immediate Action Required

### Step 1: Open Supabase Console
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project: `dashboard-supabase` (or your project name)

### Step 2: Run SQL Schema
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Paste the contents of `SUPABASE_COMPLETE_SETUP.sql` into the editor
4. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Tables Created
After running, you should see these 7 tables:
- ✅ `subscriptions` - User plans (Free/Premium/Diamond)
- ✅ `excel_uploads` - Manual Excel files (keeps 3 latest)
- ✅ `google_sheets_connections` - OAuth connections
- ✅ `ai_insights` - Saved analyses with token tracking
- ✅ `user_settings` - Theme, language, preferences
- ✅ `usage_logs` - Action tracking for plan limits
- ✅ `data_versions` - Historical versioning

### Step 4: Enable RLS Policies
Supabase auto-enables RLS when tables have policies. The SQL script includes all RLS policies, so they should be active by default.

To verify:
1. Go to **Authentication** → **Policies**
2. Each table should show policies for `user_id` filtering

### Step 5: Test Connection
Run this query in Supabase SQL Editor to confirm setup:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name NOT LIKE 'pg_%';
```

Should return 7 rows (the 7 new tables).

---

## What Gets Created

### 1. `subscriptions` Table
Stores user subscription plans with renewal dates and trial support.

**Fields:**
- `id` - UUID primary key
- `user_id` - FK to auth.users
- `plan` - 'free', 'premium', 'diamond'
- `status` - 'active', 'canceled', 'expired'
- `billing_period_start` - When current billing started
- `billing_period_end` - When current billing ends
- `trial_ends_at` - Trial expiration (nullable)
- `cancellation_date` - When user canceled (nullable)
- `metadata` - Additional data (JSONB)

**Auto-inserted default:**
- New users automatically get `plan='free'` in `AuthContext.tsx`

### 2. `excel_uploads` Table
Manual Excel uploads with auto-cleanup (keeps last 3 per dashboard).

**Fields:**
- `id` - UUID
- `user_id` - FK
- `dashboard_type` - 'despesas', 'orcamento', etc.
- `file_name` - Original filename
- `file_hash` - Hash for deduplication
- `file_size` - Bytes
- `row_count` - Rows in spreadsheet
- `data` - JSONB (parsed Excel data)
- `is_manual` - Boolean (true for manual, false for Google Sheets)
- `upload_order` - 1=oldest, 3=newest
- `upload_date` - Timestamp

**Auto-cleanup trigger:**
- Automatically deletes oldest if 4+ files exist

### 3. `google_sheets_connections` Table
OAuth connections to Google Sheets (1 per dashboard max).

**Fields:**
- `id` - UUID
- `user_id` - FK
- `dashboard_type` - Dashboard it's connected to
- `spreadsheet_name` - Name from Google Drive
- `sheet_name` - Specific sheet in spreadsheet
- `spreadsheet_id` - Google Sheets ID
- `latest_data` - JSONB (always latest version only)
- `is_active` - Boolean
- `sync_interval_seconds` - How often to auto-sync
- `last_sync` - Timestamp of last successful sync

**Key difference vs Excel:**
- Only keeps LATEST data (not 3 versions)
- Auto-syncs on schedule

### 4. `ai_insights` Table
Saved AI analyses with full tracking.

**Fields:**
- `id` - UUID
- `user_id` - FK
- `dashboard_type` - 'despesas', etc.
- `analysis_type` - 'trends', 'anomalies', 'forecast'
- `insights` - JSONB (actual analysis results)
- `tokens_used` - Integer (API tokens for cost tracking)
- `confidence_score` - 0-1 float
- `created_at` - Timestamp

### 5. `user_settings` Table
User preferences and UI settings.

**Fields:**
- `id` - UUID
- `user_id` - FK
- `theme` - 'light', 'dark', 'auto'
- `language` - 'pt-BR', 'en'
- `notifications_enabled` - Boolean
- `email_summary` - Boolean
- `preferences` - JSONB (extra settings)

### 6. `usage_logs` Table
Tracks all actions for plan limit enforcement.

**Fields:**
- `id` - UUID
- `user_id` - FK
- `action_type` - 'excel_upload', 'ai_analysis', 'pdf_export'
- `metadata` - JSONB (action details)
- `created_at` - Timestamp

**Usage:**
- Counted monthly to enforce limits
- Free: 1 excel_upload, 3 ai_analysis per month
- Premium: 10 excel_upload, 50 ai_analysis per month
- Diamond: Unlimited

### 7. `data_versions` Table
Historical versioning (optional, mostly for future use).

**Fields:**
- Similar to excel_uploads
- Can be deprecated if not needed

---

## Helper Functions Created

### 1. `is_premium_user(user_id)`
Returns true if user has premium or diamond subscription.

Usage in SQL:
```sql
SELECT is_premium_user('user-id');
```

### 2. `is_diamond_user(user_id)`
Returns true if user has diamond subscription.

### 3. `get_user_plan(user_id)`
Returns plan type: 'free', 'premium', or 'diamond'.

### 4. `cleanup_old_excel_uploads(user_id, dashboard_type)`
Deletes oldest Excel file if 3+ exist (auto-triggered on insert).

---

## Frontend Integration Status

### ✅ Completed
- `hooks/useUserPlan.ts` - Fetches user's subscription
- `utils/excelUploadManager.ts` - Upload/history/cleanup
- `components/DataInputSelector.tsx` - Manual vs Google Sheets selector
- `hooks/useUsageLimits.ts` - Check monthly usage
- `components/LimitReachedModal.tsx` - Paywall when limit reached
- `utils/usageTracker.ts` - Log usage and verify limits
- `components/Settings/DataHistoryTab.tsx` - Show last 3 uploads
- `utils/aiInsightsManager.ts` - Save and track AI analyses

### ⏳ Pending Integration
- Import DataInputSelector into `components/DataPreparation.tsx`
- Update `components/AIChat.tsx` to save insights
- Update `components/AIInsights.tsx` to track tokens
- Integrate DataHistoryTab into Settings page
- Add usage limit checks before actions

---

## Next Steps After SQL Execution

1. **Verify tables created** in Supabase console
2. **Test user creation** - Check subscriptions table gets auto-populated
3. **Test Excel upload** - Use `uploadExcelFile()` from excelUploadManager.ts
4. **Test usage tracking** - Upload file, check usage_logs table
5. **Integrate components** - Import and wire up all new hooks/components
6. **Test limits** - Create free user, upload 2 files, verify 3rd blocks
7. **Deploy to Vercel** - Push changes to main branch

---

## Troubleshooting

### Tables don't appear after SQL run?
- Check for SQL syntax errors in output
- Verify you're looking at the right project
- Try dropping tables and re-running

### RLS policies blocking all queries?
- Go to **Authentication** → **Policies**
- Edit policies to allow your test user
- Or temporarily disable RLS for testing

### Foreign key errors?
- Check auth.users table exists (it does in Supabase)
- Verify user_id format matches UUID

---

## Important Notes

🔒 **Security**: All tables have RLS policies. Users can only see their own data.

📊 **Quotas**:
- Free: 1.2GB database storage
- Excel versioning uses ~2KB per file
- 1000 files = ~2MB storage (plenty of room)

⚡ **Performance**:
- Indexes on (user_id, dashboard_type) for fast queries
- Cleanup trigger runs on every insert (minimal cost)

---

**⏰ Status**: Awaiting SQL execution in Supabase console
**👤 Assigned to**: User (manual action in Supabase UI)
**Priority**: CRITICAL - Cannot test without this
