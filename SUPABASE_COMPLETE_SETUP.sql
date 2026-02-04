-- =====================================================
-- SUPABASE COMPLETE SETUP - SAFE SCRIPT v2.0
-- =====================================================
-- Execute TUDO de uma vez no SQL Editor do Supabase
-- ✅ Cria tabelas se não existirem
-- ✅ Não apaga dados existentes
-- ✅ Ativa RLS com segurança
-- ✅ Suporta Free, Premium, Diamond
-- ✅ Excel manual (3 últimos por aba) + Google Sheets
-- ===================================================== 

-- ===== 1. CRIAR TABELA: SUBSCRIPTIONS (Free, Premium, Diamond) =====
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'premium', 'diamond', 'trial')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trialing')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

-- ===== 2. CRIAR TABELA: DATA_VERSIONS =====
CREATE TABLE IF NOT EXISTS public.data_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa VARCHAR NOT NULL,
    file_name VARCHAR NOT NULL,
    file_hash VARCHAR NOT NULL,
    data_type VARCHAR NOT NULL,
    data_source VARCHAR,
    file_size INT,
    row_count INT,
    version_number INT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    notes VARCHAR,
    
    UNIQUE(user_id, empresa, file_name, version_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_data_versions_user_id ON public.data_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_data_versions_empresa ON public.data_versions(empresa);
CREATE INDEX IF NOT EXISTS idx_data_versions_created_at ON public.data_versions(created_at DESC);

-- ===== 3. CRIAR TABELA: EXCEL_UPLOADS (Manual - últimos 3 por aba) =====
CREATE TABLE IF NOT EXISTS public.excel_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_type VARCHAR NOT NULL, -- 'despesas', 'receitas', 'balancete', etc
    file_name VARCHAR NOT NULL,
    file_hash VARCHAR NOT NULL,
    file_size INT,
    row_count INT,
    upload_date TIMESTAMP DEFAULT NOW(),
    data JSONB NOT NULL,
    is_manual BOOLEAN DEFAULT true,
    upload_order INT,
    
    UNIQUE(user_id, dashboard_type, file_hash)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_excel_uploads_user_id ON public.excel_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_excel_uploads_dashboard ON public.excel_uploads(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_excel_uploads_date ON public.excel_uploads(upload_date DESC);

-- ===== 4. CRIAR TABELA: GOOGLE_SHEETS_CONNECTIONS (Apenas última versão) =====
CREATE TABLE IF NOT EXISTS public.google_sheets_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_type VARCHAR NOT NULL, -- 'despesas', 'receitas', etc
    spreadsheet_id VARCHAR NOT NULL,
    spreadsheet_name VARCHAR NOT NULL,
    sheet_name VARCHAR NOT NULL,
    range_data VARCHAR DEFAULT 'A1:Z1000',
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    google_user_email VARCHAR,
    last_sync TIMESTAMP,
    sync_interval_seconds INT DEFAULT 3600, -- Default: a cada 1 hora
    is_active BOOLEAN DEFAULT true,
    latest_data JSONB, -- Apenas última versão
    latest_row_count INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, spreadsheet_id, dashboard_type)
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_google_sheets_user_id ON public.google_sheets_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_dashboard ON public.google_sheets_connections(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_google_sheets_active ON public.google_sheets_connections(is_active);

-- ===== 5. CRIAR TABELA: AI_INSIGHTS (Salvos e rastreáveis) =====
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa VARCHAR NOT NULL,
    dashboard_type VARCHAR NOT NULL, -- 'despesas', 'receitas', 'balancete', etc
    analysis_type VARCHAR NOT NULL, -- 'trend', 'anomaly', 'forecast', 'summary'
    insights JSONB NOT NULL,
    confidence_score NUMERIC,
    tokens_used INT, -- Para rastrear custo de API
    generation_time_ms INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dashboard ON public.ai_insights(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON public.ai_insights(created_at DESC);

-- ===== 6. CRIAR TABELA: USER_SETTINGS (Preferências do usuário) =====
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'dark', -- 'dark', 'light'
    language TEXT DEFAULT 'pt-BR', -- 'pt-BR', 'en'
    ai_analysis_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    notifications_enabled BOOLEAN DEFAULT true,
    email_reports BOOLEAN DEFAULT false,
    preferred_currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- ===== 7. CRIAR TABELA: USAGE_LOGS (Rastrear uso por plano) =====
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL, -- 'excel_upload', 'google_sync', 'ai_analysis', 'pdf_export'
    dashboard_type VARCHAR,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON public.usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - ATIVAR
-- =====================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sheets_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - SUBSCRIPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert their own subscription"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
CREATE POLICY "Users can update their own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - DATA_VERSIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own data versions" ON public.data_versions;
CREATE POLICY "Users can view their own data versions"
    ON public.data_versions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create data versions" ON public.data_versions;
CREATE POLICY "Users can create data versions"
    ON public.data_versions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - EXCEL_UPLOADS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their Excel uploads" ON public.excel_uploads;
CREATE POLICY "Users can view their Excel uploads"
    ON public.excel_uploads FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create Excel uploads" ON public.excel_uploads;
CREATE POLICY "Users can create Excel uploads"
    ON public.excel_uploads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their old Excel uploads" ON public.excel_uploads;
CREATE POLICY "Users can delete their old Excel uploads"
    ON public.excel_uploads FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - GOOGLE_SHEETS_CONNECTIONS (Atualizado)
-- =====================================================

DROP POLICY IF EXISTS "Users can view their Google Sheets connections" ON public.google_sheets_connections;
CREATE POLICY "Users can view their Google Sheets connections"
    ON public.google_sheets_connections FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create Google Sheets connections" ON public.google_sheets_connections;
CREATE POLICY "Users can create Google Sheets connections"
    ON public.google_sheets_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their Google Sheets connections" ON public.google_sheets_connections;
CREATE POLICY "Users can update their Google Sheets connections"
    ON public.google_sheets_connections FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - USER_SETTINGS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their settings" ON public.user_settings;
CREATE POLICY "Users can view their settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their settings" ON public.user_settings;
CREATE POLICY "Users can update their settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - USAGE_LOGS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their usage logs" ON public.usage_logs;
CREATE POLICY "Users can view their usage logs"
    ON public.usage_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create usage logs" ON public.usage_logs;
CREATE POLICY "Users can create usage logs"
    ON public.usage_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA - AI_INSIGHTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their AI insights" ON public.ai_insights;
CREATE POLICY "Users can view their AI insights"
    ON public.ai_insights FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create AI insights" ON public.ai_insights;
CREATE POLICY "Users can create AI insights"
    ON public.ai_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES UTILITÁRIAS
-- =====================================================

-- Função 1: Verificar se usuário é premium ou melhor
CREATE OR REPLACE FUNCTION is_premium_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.subscriptions 
        WHERE user_id = check_user_id
        AND status = 'active'
        AND plan IN ('premium', 'diamond', 'trial')
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função 2: Verificar se usuário é diamond
CREATE OR REPLACE FUNCTION is_diamond_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.subscriptions 
        WHERE user_id = check_user_id
        AND status = 'active'
        AND plan = 'diamond'
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função 3: Obter plano do usuário
CREATE OR REPLACE FUNCTION get_user_plan(check_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_plan TEXT;
BEGIN
    SELECT plan INTO user_plan
    FROM public.subscriptions 
    WHERE user_id = check_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1;
    
    RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função 4: Deletar uploads de Excel antigos (manter apenas 3)
CREATE OR REPLACE FUNCTION cleanup_old_excel_uploads()
RETURNS void AS $$
BEGIN
    DELETE FROM public.excel_uploads eu
    WHERE id NOT IN (
        SELECT id FROM public.excel_uploads 
        WHERE user_id = eu.user_id 
        AND dashboard_type = eu.dashboard_type
        ORDER BY upload_date DESC 
        LIMIT 3
    )
    AND user_id = eu.user_id 
    AND dashboard_type = eu.dashboard_type;
END;
$$ LANGUAGE plpgsql;

-- Função 5: Update timestamp automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_sheets_connections_updated_at ON public.google_sheets_connections;
CREATE TRIGGER update_google_sheets_connections_updated_at
    BEFORE UPDATE ON public.google_sheets_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_insights_updated_at ON public.ai_insights;
CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON public.ai_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Ver tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'data_versions', 'google_sheets_connections', 'ai_insights')
ORDER BY table_name;

-- =====================================================
-- ✅ SETUP COMPLETO!
-- =====================================================
-- Se chegou aqui, tudo foi criado com sucesso!
-- Próximo passo: Executar comandos para tornar usuário premium
