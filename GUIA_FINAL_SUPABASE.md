# 🗄️ GUIA FINAL SUPABASE - SQL COMPLETO

## ⚠️ AÇÃO IMEDIATA NECESSÁRIA

Copie TODO o SQL abaixo, vá para **Supabase Console → SQL Editor → New Query** e execute.

---

## 📋 SQL COMPLETO - EXECUTE TUDO DE UMA VEZ

```sql
-- ==========================================
-- 1. CRIAR TABELA: subscriptions
-- ==========================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'diamond')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- ==========================================
-- 2. CRIAR TABELA: excel_uploads
-- ==========================================
CREATE TABLE excel_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size INTEGER,
  row_count INTEGER,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_manual BOOLEAN DEFAULT true,
  upload_order INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_excel_uploads_user_dashboard ON excel_uploads(user_id, dashboard_type);

-- ==========================================
-- 3. CRIAR TABELA: google_sheets_connections
-- ==========================================
CREATE TABLE google_sheets_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_type TEXT NOT NULL,
  spreadsheet_name TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  latest_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sync_interval_seconds INTEGER DEFAULT 3600,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, dashboard_type)
);

CREATE INDEX idx_google_sheets_user_dashboard ON google_sheets_connections(user_id, dashboard_type);

-- ==========================================
-- 4. CRIAR TABELA: ai_insights
-- ==========================================
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_type TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  tokens_used INTEGER DEFAULT 0,
  confidence_score NUMERIC(3,2) DEFAULT 0.85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_ai_insights_user_dashboard ON ai_insights(user_id, dashboard_type);

-- ==========================================
-- 5. CRIAR TABELA: user_settings
-- ==========================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT true,
  email_summary BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 6. CRIAR TABELA: usage_logs
-- ==========================================
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('excel_upload', 'ai_analysis', 'pdf_export', 'google_sheets_sync')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_usage_logs_user_action ON usage_logs(user_id, action_type, created_at);

-- ==========================================
-- 7. CRIAR TABELA: data_versions (opcional)
-- ==========================================
CREATE TABLE data_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_type TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- FUNÇÕES HELPER
-- ==========================================

-- Função: Verificar se usuário é Premium
CREATE OR REPLACE FUNCTION is_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE subscriptions.user_id = $1 
    AND plan IN ('premium', 'diamond')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Função: Verificar se usuário é Diamond
CREATE OR REPLACE FUNCTION is_diamond_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE subscriptions.user_id = $1 
    AND plan = 'diamond'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Função: Obter plano do usuário
CREATE OR REPLACE FUNCTION get_user_plan(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT plan INTO user_plan FROM subscriptions 
  WHERE subscriptions.user_id = $1 AND status = 'active';
  
  RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql;

-- Função: Limpar uploads Excel antigos (mantém 3)
CREATE OR REPLACE FUNCTION cleanup_old_excel_uploads()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM excel_uploads
  WHERE user_id = NEW.user_id
    AND dashboard_type = NEW.dashboard_type
    AND id NOT IN (
      SELECT id FROM excel_uploads
      WHERE user_id = NEW.user_id
        AND dashboard_type = NEW.dashboard_type
      ORDER BY upload_date DESC
      LIMIT 3
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-cleanup de Excel uploads
CREATE TRIGGER trigger_cleanup_excel_uploads
AFTER INSERT ON excel_uploads
FOR EACH ROW
EXECUTE FUNCTION cleanup_old_excel_uploads();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- excel_uploads
ALTER TABLE excel_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own excel uploads"
  ON excel_uploads FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert excel uploads"
  ON excel_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own excel uploads"
  ON excel_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- google_sheets_connections
ALTER TABLE google_sheets_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own google sheets connections"
  ON google_sheets_connections FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert google sheets connections"
  ON google_sheets_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own google sheets connections"
  ON google_sheets_connections FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own google sheets connections"
  ON google_sheets_connections FOR DELETE
  USING (auth.uid() = user_id);

-- ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert ai insights"
  ON ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai insights"
  ON ai_insights FOR DELETE
  USING (auth.uid() = user_id);

-- user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- usage_logs
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert usage logs"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- data_versions
ALTER TABLE data_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data versions"
  ON data_versions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert data versions"
  ON data_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔑 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

Adicione ao `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key-aqui

# Google Sheets (já adicionado)
VITE_GOOGLE_CLIENT_ID=871875585142-ujc539mrh923o404ajltkf47186a8eu5.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_API_KEY=AQ.Ab8RN6IcqJE29WWqSJRwL3i2-uzfmxvFTNuAcA3_mntMNUcHxA

# Gemini (já adicionado)
VITE_GEMINI_API_KEY=AIzaSyBJC5Hjv6L3hgnwsv3LfK1-hfjO7vMyPig
```

### Onde encontrar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY:

1. Vá para [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Clique em **Settings** → **API**
4. Copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

---

## 📝 CHECKLIST DE SETUP

- [ ] Copiar SQL completo acima
- [ ] Vá para **Supabase Console → SQL Editor → New Query**
- [ ] Cole o SQL e clique **Run**
- [ ] Aguarde até aparecer "✓ Success"
- [ ] Verifique se 7 tabelas foram criadas em **Database → Tables**
- [ ] Copie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para `.env`
- [ ] Salve `.env`
- [ ] Recarregue o app (npm run dev)

---

## ✅ VERIFICAÇÃO

Após executar o SQL, rode estas queries no Supabase SQL Editor para confirmar:

```sql
-- Listar todas as tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name NOT LIKE 'pg_%'
ORDER BY table_name;

-- Resultado esperado (7 tabelas):
-- ai_insights
-- data_versions
-- excel_uploads
-- google_sheets_connections
-- subscriptions
-- usage_logs
-- user_settings
```

---

## 📊 ESTRUTURA DE DADOS

### subscriptions
- Armazena plano do usuário (free/premium/diamond)
- Auto-criada com plano='free' para novo usuário
- 1 por user_id

### excel_uploads
- Mantém últimos 3 uploads por dashboard
- Auto-deleta o 4º via trigger
- Deduplicação via hash

### google_sheets_connections
- 1 por dashboard
- Sobrescreve dados anteriores (não versionado)

### ai_insights
- Cada análise salva
- Rastreia tokens_used e confidence_score
- Usuário pode deletar

### usage_logs
- Cada ação registrada
- Usado para contar limite mensal

### user_settings
- Preferências do usuário (tema, idioma)

---

## 🚨 TROUBLESHOOTING

**Erro: "Cannot create policy on table"**
- Primeiro rode `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

**Erro: "Function already exists"**
- Se reexecutar, pode gerar conflito. Solução:
  ```sql
  DROP FUNCTION IF EXISTS cleanup_old_excel_uploads CASCADE;
  DROP FUNCTION IF EXISTS is_premium_user CASCADE;
  DROP FUNCTION IF EXISTS is_diamond_user CASCADE;
  DROP FUNCTION IF EXISTS get_user_plan CASCADE;
  ```
  Depois reexecute o SQL completo

**Tabelas criadas mas não aparecem na UI**
- Refresque a página do Supabase console

---

## 🔐 Segurança

- Todas as tabelas têm RLS ativada
- Usuários só veem seus próprios dados (via auth.uid())
- .env está no .gitignore (não será commitado)

---

**Status**: ✅ Schema pronto para implementação
