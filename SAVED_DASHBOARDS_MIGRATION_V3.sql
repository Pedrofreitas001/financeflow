-- Migracao para permitir versionamento (ultimas 3 versoes por dashboard)
-- 1) Remover constraint de unicidade (se existir)
ALTER TABLE saved_dashboards
  DROP CONSTRAINT IF EXISTS saved_dashboards_user_id_dashboard_type_key;

-- 2) Atualizar o check constraint se necessario
ALTER TABLE saved_dashboards
  DROP CONSTRAINT IF EXISTS saved_dashboards_dashboard_type_check;

ALTER TABLE saved_dashboards
  ADD CONSTRAINT saved_dashboards_dashboard_type_check
  CHECK (dashboard_type IN ('dashboard', 'despesas', 'dre', 'cashflow', 'indicadores', 'orcamento', 'balancete'));

-- 3) Indice para ordenar por versao mais recente
CREATE INDEX IF NOT EXISTS idx_saved_dashboards_user_type_created
  ON saved_dashboards(user_id, dashboard_type, created_at DESC);
