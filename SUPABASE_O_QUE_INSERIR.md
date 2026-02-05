# O que inserir exatamente no Supabase

**Nota:** Não é possível conectar diretamente ao seu Supabase daqui. Este guia indica exatamente o que você deve executar no painel do Supabase (SQL Editor e Edge Functions / Secrets) para que o app funcione.

## 1. Rodar o projeto em dev

No terminal, na pasta do projeto:

```bash
npm run dev
```

O Vite sobe em **http://localhost:5173** (ou a porta que aparecer no terminal).

---

## 2. No painel do Supabase (https://supabase.com/dashboard)

### 2.1 SQL Editor – tabelas e políticas

Abra **SQL Editor** e execute os scripts **nesta ordem** (um por vez, se preferir):

| Ordem | Arquivo no projeto | O que faz |
|-------|--------------------|-----------|
| 1 | `SAVED_DASHBOARDS_TABLE.sql` | Tabela `saved_dashboards` (versões salvas + Google Sheets) |
| 2 | `SUPABASE_GOOGLE_SHEETS_SETUP.sql` | Tabela `google_sheets_connections` e políticas RLS |
| 3 | `SUPABASE_COMPLETE_SETUP.sql` | Outras tabelas (subscriptions, excel_uploads, etc.) e políticas |

**Como fazer:**  
Em cada arquivo, copie **todo** o conteúdo e cole no SQL Editor do Supabase → **Run**.

Se já tiver rodado o `SUPABASE_COMPLETE_SETUP.sql` antes, pode pular a criação de tabelas que já existem e rodar só o que falta (por exemplo só `SAVED_DASHBOARDS_TABLE.sql` e `SUPABASE_GOOGLE_SHEETS_SETUP.sql` se ainda não tiver `saved_dashboards` e `google_sheets_connections`).

---

### 2.2 Edge Functions – secrets (Google Sheets + fetch-one)

Para o botão **Atualizar** e a conexão com Google Sheets funcionarem, a Edge Function precisa destas variáveis.

No Supabase: **Project Settings** (ícone de engrenagem) → **Edge Functions** → **Secrets** (ou **Settings** → **Edge Functions** → **Manage secrets**).

Adicione estes **secrets** (nome exatamente como abaixo):

| Nome do secret | Valor | Onde pegar |
|-----------------|--------|------------|
| `GOOGLE_CLIENT_ID` | (string) | Mesmo do seu `.env`: `VITE_GOOGLE_CLIENT_ID` |
| `GOOGLE_CLIENT_SECRET` | (string) | Mesmo do seu `.env`: `VITE_GOOGLE_CLIENT_SECRET` |
| `SUPABASE_ANON_KEY` | (string) | **Project Settings** → **API** → **Project API keys** → **anon public** |

Não precisa criar `SUPABASE_URL` nem `SUPABASE_SERVICE_ROLE_KEY`: o Supabase já injeta esses nas Edge Functions.

---

### 2.3 Publicar a Edge Function `google-sheets-fetch-one`

No terminal (com Supabase CLI instalado e logado):

```bash
cd c:\Users\Samsung\Desktop\dashboard\dashboard-webapp-contb
supabase functions deploy google-sheets-fetch-one
```

Se ainda não tiver a CLI: https://supabase.com/docs/guides/functions/deploy  
Ou use o fluxo pelo painel: **Edge Functions** → **Deploy new function** e faça upload do código da pasta `supabase/functions/google-sheets-fetch-one`.

---

## 3. Resumo rápido

- **Dev:** `npm run dev` → acesse o endereço que aparecer no terminal.
- **Supabase – SQL:** rodar (nessa ordem) `SAVED_DASHBOARDS_TABLE.sql`, `SUPABASE_GOOGLE_SHEETS_SETUP.sql` e o que faltar do `SUPABASE_COMPLETE_SETUP.sql`.
- **Supabase – Secrets:** criar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `SUPABASE_ANON_KEY`.
- **Supabase – Edge Function:** fazer deploy de `google-sheets-fetch-one` (CLI ou painel).

Depois disso, o app em dev deve conseguir salvar/carregar dados e usar o botão **Atualizar** do Google Sheets (desde que o usuário esteja logado e tenha uma conexão configurada).

---

## 4. Se der erro na Edge Function

Se o botão **Atualizar** (Google Sheets) mostrar erro, em geral é porque:

1. A edge function `google-sheets-fetch-one` ainda não foi publicada → faça o deploy (item 2.3).
2. Os **Secrets** não estão configurados → confira o item 2.2 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SUPABASE_ANON_KEY).
3. As tabelas `google_sheets_connections` e `saved_dashboards` não existem → rode os SQL do item 2.1.

O app trata o erro e exibe uma mensagem amigável (toast); ele não quebra mesmo se a edge function falhar.
