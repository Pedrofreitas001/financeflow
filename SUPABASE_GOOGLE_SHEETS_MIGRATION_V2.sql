-- Migracao para suportar dashboard_type e sheet_name nas conexoes

ALTER TABLE google_sheets_connections
  ADD COLUMN IF NOT EXISTS dashboard_type TEXT,
  ADD COLUMN IF NOT EXISTS sheet_name VARCHAR,
  ADD COLUMN IF NOT EXISTS range VARCHAR DEFAULT 'A1:Z1000';

CREATE INDEX IF NOT EXISTS idx_google_sheets_connections_dashboard
  ON google_sheets_connections(user_id, dashboard_type);
