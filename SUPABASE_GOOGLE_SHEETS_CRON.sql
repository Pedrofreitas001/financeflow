-- Agendamento do sync 3x ao dia
-- Substitua <PROJECT_REF> pelo seu project ref do Supabase

select
  cron.schedule(
    'google-sheets-sync',
    '0 6,14,22 * * *',
    $$
    select
      net.http_post(
        url := 'https://<PROJECT_REF>.functions.supabase.co/google-sheets-sync',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := jsonb_build_object('trigger', 'cron')
      );
    $$
  );
