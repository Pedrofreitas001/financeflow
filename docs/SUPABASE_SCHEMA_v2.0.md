# 📊 Nova Estrutura Supabase v2.0 - Completa

## 📋 7 Tabelas Principais

### 1. **subscriptions** - Planos (Free, Premium, Diamond)
```sql
Campos:
- user_id: Qual usuário
- plan: 'free', 'premium', 'diamond', 'trial'
- status: 'active', 'canceled', 'expired', 'trialing'
- expires_at: Data de expiração
```

### 2. **excel_uploads** - Excel Manual (últimos 3 por aba)
```sql
Campos:
- user_id: Qual usuário
- dashboard_type: 'despesas', 'receitas', 'balancete', etc
- file_name: Nome do arquivo
- file_hash: Para evitar duplicatas
- data: JSONB com dados do Excel
- upload_date: Quando foi inserido
- is_manual: true (sempre)

⚠️ IMPORTANTE: Sistema AUTOMÁTICO deleta uploads antigos
    → Mantém sempre apenas 3 últimos por dashboard
    → Recuperáveis em Settings > Histórico
```

### 3. **google_sheets_connections** - Google Sheets (apenas última)
```sql
Campos:
- user_id: Qual usuário
- dashboard_type: 'despesas', 'receitas', etc
- spreadsheet_id: ID do Google Sheets
- sheet_name: Nome da aba
- access_token: Token OAuth
- refresh_token: Para renovar acesso
- latest_data: JSONB com ÚLTIMA versão
- last_sync: Última sincronização
- sync_interval_seconds: A cada quanto sync

✅ DIFERENÇA:
- Excel: Salva últimos 3
- Google Sheets: Salva apenas 1 (última versão)
- Ambos sincronizam automaticamente
```

### 4. **data_versions** - Histórico Completo (opcional, pode deprecar)
```sql
Campos:
- user_id, empresa, file_name
- version_number: Número da versão
- data_type: 'excel', 'google_sheets', 'csv'
- data: JSONB com dados completos

💡 Pode ser deprecado se não precisar de histórico ultra-completo
```

### 5. **ai_insights** - Análises de IA (salvos)
```sql
Campos:
- user_id, dashboard_type
- analysis_type: 'trend', 'anomaly', 'forecast', 'summary'
- insights: JSONB com resultado da IA
- tokens_used: Custo API
- confidence_score: % de confiança
```

### 6. **user_settings** - Preferências (Settings página)
```sql
Campos:
- user_id
- theme: 'dark', 'light'
- language: 'pt-BR', 'en'
- notifications_enabled: true/false
- email_reports: true/false
```

### 7. **usage_logs** - Rastreamento (Free vs Premium vs Diamond)
```sql
Campos:
- user_id
- action: 'excel_upload', 'google_sync', 'ai_analysis', 'pdf_export'
- dashboard_type
- created_at

💡 Uso: Limitar ações por plano
- Free: 1 upload/mês, 3 análises/mês
- Premium: 10 uploads/mês, 50 análises/mês
- Diamond: Ilimitado
```

---

## 🔄 FLUXO: Excel Manual vs Google Sheets

### Cenário 1: Upload Manual de Excel

```
1. Usuário clica "Inserir Dados"
2. Sistema pergunta: "Manual ou Google Sheets?"
3. Usuário escolhe "Manual"
4. Faz upload do Excel
5. Sistema salva em excel_uploads
   ├─ Se já tem 3 uploads
   │  └─ Deleta o mais antigo automaticamente
   └─ Exibe em Settings > Histórico
6. Usuário pode:
   - Re-fazer upload de um histórico
   - Deletar manualmente
```

### Cenário 2: Sincronização Google Sheets

```
1. Usuário clica "Inserir Dados"
2. Sistema pergunta: "Manual ou Google Sheets?"
3. Usuário escolhe "Google Sheets"
4. Conecta conta Google
5. Sistema sincroniza a cada X minutos
   ├─ Busca última versão do Sheets
   ├─ Verifica se mudou (hash)
   ├─ Se mudou:
   │  ├─ Atualiza latest_data
   │  └─ Log em usage_logs
   └─ Se não mudou: Skip
6. Em Settings > Histórico:
   - Mostra conexão ativa
   - Última sincronização
   - Intervalo de sync
```

---

## 🎯 Planos: Free vs Premium vs Diamond

| Recurso | Free | Premium | Diamond |
|---------|------|---------|---------|
| **Excel uploads/mês** | 1 | 10 | Ilimitado |
| **Google Sheets** | Não | Sim (1 aba) | Sim (5 abas) |
| **AI análises/mês** | 3 | 50 | Ilimitado |
| **Histórico Excel** | 1 último | 3 últimos | 3 últimos |
| **Exportar PDF** | Não | Sim | Sim |
| **Dashboards** | Básico | Completo | Completo + Custom |

---

## 💾 Comandos Rápidos

### Ver plano do usuário
```sql
SELECT get_user_plan('user-uuid') as plano;
```

### Verificar se é premium
```sql
SELECT is_premium_user('user-uuid') as is_premium;
```

### Verificar se é diamond
```sql
SELECT is_diamond_user('user-uuid') as is_diamond;
```

### Ver últimos 3 uploads Excel de um usuário
```sql
SELECT file_name, upload_date, row_count
FROM excel_uploads
WHERE user_id = 'user-uuid'
AND dashboard_type = 'despesas'
ORDER BY upload_date DESC
LIMIT 3;
```

### Ver conexão Google Sheets ativa
```sql
SELECT spreadsheet_name, sheet_name, last_sync, sync_interval_seconds
FROM google_sheets_connections
WHERE user_id = 'user-uuid' AND is_active = true;
```

### Ver histórico de AI análises
```sql
SELECT analysis_type, confidence_score, created_at
FROM ai_insights
WHERE user_id = 'user-uuid'
AND dashboard_type = 'despesas'
ORDER BY created_at DESC
LIMIT 10;
```

### Contar uso mensal de um usuário (para limitar no Free)
```sql
SELECT 
    COUNT(CASE WHEN action = 'excel_upload' THEN 1 END) as uploads_month,
    COUNT(CASE WHEN action = 'ai_analysis' THEN 1 END) as analyses_month
FROM usage_logs
WHERE user_id = 'user-uuid'
AND created_at > NOW() - INTERVAL '1 month';
```

---

## 🔐 Segurança & RLS

✅ Cada usuário só vê seus próprios dados
✅ Tokens criptografados no Supabase
✅ Políticas automáticas por tabela
✅ Funções com SECURITY DEFINER para admin

---

## 🚀 Próximas Steps

1. **Execute** `SUPABASE_COMPLETE_SETUP.sql` no SQL Editor
2. **Implemente** lógica de limite por plano (check usage_logs)
3. **Configure** paywall no frontend (mostrar limite atingido)
4. **Setup** Stripe/payment quando pronto

---

**Status:** ✅ Schema pronto! Só falta implementar no frontend!
