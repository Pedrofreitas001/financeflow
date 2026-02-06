-- Migration V3: Fix unique constraint for google_sheets_connections
-- The old constraint UNIQUE(user_id, spreadsheet_id) causes issues when the same user
-- connects different spreadsheets to the same dashboard type, or when spreadsheet_id is empty.
-- We need UNIQUE(user_id, dashboard_type) so each user has one connection per dashboard tab.

-- 1. Drop the old unique constraint (may have different names depending on setup)
DO $$
BEGIN
    -- Try dropping by common constraint names
    ALTER TABLE google_sheets_connections DROP CONSTRAINT IF EXISTS google_sheets_connections_user_id_spreadsheet_id_key;
    ALTER TABLE google_sheets_connections DROP CONSTRAINT IF EXISTS google_sheets_connections_user_id_spreadsheet_id_dashboard_type_key;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Old constraint may not exist, continuing...';
END $$;

-- 2. Ensure dashboard_type has a default value for any existing rows
UPDATE google_sheets_connections
SET dashboard_type = 'dashboard'
WHERE dashboard_type IS NULL OR dashboard_type = '';

-- 3. Make dashboard_type NOT NULL
ALTER TABLE google_sheets_connections
  ALTER COLUMN dashboard_type SET NOT NULL,
  ALTER COLUMN dashboard_type SET DEFAULT 'dashboard';

-- 4. Make spreadsheet_id nullable (it may be empty during setup)
ALTER TABLE google_sheets_connections
  ALTER COLUMN spreadsheet_id DROP NOT NULL;

-- 5. Make spreadsheet_name nullable
ALTER TABLE google_sheets_connections
  ALTER COLUMN spreadsheet_name DROP NOT NULL;

-- 6. Add the new unique constraint on (user_id, dashboard_type)
ALTER TABLE google_sheets_connections
  ADD CONSTRAINT google_sheets_connections_user_dashboard_type_key
  UNIQUE (user_id, dashboard_type);

-- 7. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_sheets_connections_user_dashboard
  ON google_sheets_connections(user_id, dashboard_type);
