-- SUPABASE: Google Sheets Integration Schema

-- Tabela para armazenar conexões do Google Sheets
CREATE TABLE google_sheets_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spreadsheet_id VARCHAR NOT NULL,
  spreadsheet_name VARCHAR NOT NULL,
  sheet_names VARCHAR[] NOT NULL, -- array de nomes das abas
  access_token TEXT NOT NULL, -- criptografado
  refresh_token TEXT NOT NULL, -- criptografado
  google_user_email VARCHAR,
  last_sync TIMESTAMP,
  sync_interval_seconds INT DEFAULT 120,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, spreadsheet_id)
);

-- Tabela de versões (melhorada para Google Sheets)
CREATE TABLE data_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa VARCHAR NOT NULL,
  file_name VARCHAR NOT NULL,
  file_hash VARCHAR NOT NULL,
  data_type VARCHAR NOT NULL, -- 'excel', 'google_sheets', 'csv'
  data_source VARCHAR, -- 'upload', 'google_sheets_sync'
  file_size INT,
  row_count INT,
  version_number INT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  notes VARCHAR,
  
  UNIQUE(user_id, empresa, file_name, version_number)
);

-- Índices para performance
CREATE INDEX idx_data_versions_user_id ON data_versions(user_id);
CREATE INDEX idx_data_versions_empresa ON data_versions(empresa);
CREATE INDEX idx_data_versions_created_at ON data_versions(created_at DESC);
CREATE INDEX idx_google_sheets_user_id ON google_sheets_connections(user_id);

-- Row Level Security
ALTER TABLE google_sheets_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_versions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can see their own Google Sheets connections"
  ON google_sheets_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Google Sheets connections"
  ON google_sheets_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Sheets connections"
  ON google_sheets_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their own data versions"
  ON data_versions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data versions"
  ON data_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Função para limpar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM google_sheets_connections
  WHERE last_sync < NOW() - INTERVAL '30 days'
  AND is_active = false;
END;
$$ LANGUAGE plpgsql;
