-- =====================================================
-- TABELA PARA ARMAZENAR INSIGHTS DE IA
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela ai_insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa TEXT NOT NULL,
    dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('visao_geral', 'despesas', 'dre', 'fluxo_caixa', 'balancete', 'indicadores', 'orcamento')),
    periodo TEXT NOT NULL, -- Ex: "janeiro 2026", "Q1 2026"
    
    -- Resultados da análise (formato JSON)
    insights JSONB DEFAULT '[]'::jsonb,
    trends JSONB DEFAULT '[]'::jsonb,
    alerts JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Contexto empresarial usado na análise
    business_context JSONB,
    
    -- Dados brutos usados na análise (opcional, para auditoria)
    raw_data JSONB,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_empresa ON public.ai_insights(empresa);
CREATE INDEX idx_ai_insights_dashboard_type ON public.ai_insights(dashboard_type);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights(created_at DESC);
CREATE INDEX idx_ai_insights_user_empresa ON public.ai_insights(user_id, empresa);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança - Usuário só acessa seus próprios insights
CREATE POLICY "Usuários podem ver seus próprios insights"
    ON public.ai_insights
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios insights"
    ON public.ai_insights
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios insights"
    ON public.ai_insights
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios insights"
    ON public.ai_insights
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para atualizar updated_at
CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON public.ai_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Comentários para documentação
COMMENT ON TABLE public.ai_insights IS 'Armazena insights gerados pela IA para análises de dashboard';
COMMENT ON COLUMN public.ai_insights.dashboard_type IS 'Tipo de dashboard analisado: visao_geral, despesas, dre, fluxo_caixa, balancete, indicadores, orcamento';
COMMENT ON COLUMN public.ai_insights.insights IS 'Array de insights principais identificados';
COMMENT ON COLUMN public.ai_insights.trends IS 'Array de tendências identificadas';
COMMENT ON COLUMN public.ai_insights.alerts IS 'Array de alertas críticos';
COMMENT ON COLUMN public.ai_insights.recommendations IS 'Array de recomendações práticas';
COMMENT ON COLUMN public.ai_insights.confidence IS 'Nível de confiança da análise (0 a 1)';
COMMENT ON COLUMN public.ai_insights.business_context IS 'Contexto empresarial usado (segmento, localização, etc)';

-- =====================================================
-- QUERIES ÚTEIS
-- =====================================================

-- Ver todos os insights de um usuário
-- SELECT * FROM ai_insights WHERE user_id = 'USER_ID' ORDER BY created_at DESC;

-- Ver insights recentes de uma empresa
-- SELECT * FROM ai_insights WHERE empresa = 'Alpha' ORDER BY created_at DESC LIMIT 10;

-- Ver apenas insights de despesas
-- SELECT * FROM ai_insights WHERE dashboard_type = 'despesas' ORDER BY created_at DESC;

-- Ver insights com alta confiança
-- SELECT * FROM ai_insights WHERE confidence >= 0.85 ORDER BY created_at DESC;

-- Contar insights por tipo de dashboard
-- SELECT dashboard_type, COUNT(*) as total FROM ai_insights GROUP BY dashboard_type;

-- =====================================================
-- FINALIZADO
-- =====================================================
-- Após executar este script:
-- 1. Verifique se a tabela foi criada: SELECT * FROM ai_insights;
-- 2. Teste as políticas de segurança logando com um usuário
-- 3. Integre com o código TypeScript usando Supabase client
