-- Tabela para salvar os dados dos dashboards do usuário
-- Permite auto-load na próxima entrada

CREATE TABLE IF NOT EXISTS saved_dashboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('dashboard', 'despesas', 'dre', 'cashflow', 'balancete')),
    data JSONB NOT NULL, -- Array de objetos com os dados
    row_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Um usuário só pode ter uma versão salva por tipo de dashboard
    UNIQUE(user_id, dashboard_type)
);

-- Index para buscar rapidamente os dados salvos de um usuário
CREATE INDEX IF NOT EXISTS idx_saved_dashboards_user_id ON saved_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_dashboards_user_type ON saved_dashboards(user_id, dashboard_type);

-- RLS (Row Level Security)
ALTER TABLE saved_dashboards ENABLE ROW LEVEL SECURITY;

-- Policy: usuários só podem ver seus próprios dados salvos
CREATE POLICY "Users can view own saved dashboards" ON saved_dashboards
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: usuários podem inserir seus próprios dados
CREATE POLICY "Users can insert own saved dashboards" ON saved_dashboards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own saved dashboards" ON saved_dashboards
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: usuários podem deletar seus próprios dados
CREATE POLICY "Users can delete own saved dashboards" ON saved_dashboards
    FOR DELETE USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE saved_dashboards IS 'Armazena dados salvos dos dashboards para auto-load na próxima entrada do usuário';
COMMENT ON COLUMN saved_dashboards.user_id IS 'ID do usuário que salvou os dados';
COMMENT ON COLUMN saved_dashboards.dashboard_type IS 'Tipo do dashboard: dashboard, despesas, dre, cashflow, balancete';
COMMENT ON COLUMN saved_dashboards.data IS 'Array JSON com os dados do dashboard';
COMMENT ON COLUMN saved_dashboards.row_count IS 'Número de linhas/registros nos dados';
