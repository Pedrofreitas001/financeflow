// utils/googleSheetsFetchOne.ts
// Busca dados do Google Sheets - tenta edge function, com fallback client-side + auto-refresh de token.

import { supabase } from '@/lib/supabase';
import { saveDashboardData } from '@/utils/savedDashboardManager';

export type DashboardType = 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

/**
 * Verifica se existe conexão ativa com Google Sheets para o dashboard.
 */
export async function hasGoogleSheetsConnection(
    userId: string,
    dashboardType: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from('google_sheets_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('dashboard_type', dashboardType)
        .eq('is_active', true)
        .maybeSingle();

    if (error) return false;
    return !!data;
}

/**
 * Converte valores brutos do Google Sheets (array de arrays) em objetos.
 * Primeira linha = headers.
 */
function toObjects(values: any[][]): Record<string, any>[] {
    if (!values || values.length === 0) return [];
    const headers = values[0].map((h: any) => String(h || '').trim());
    return values.slice(1).map((row: any[]) => {
        const obj: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
            if (header) {
                obj[header] = row[index] ?? '';
            }
        });
        return obj;
    });
}

/**
 * Usa o refresh_token para obter um novo access_token do Google.
 * Retorna o novo access_token ou null se falhar.
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !refreshToken) {
        return null;
    }

    try {
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        });

        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        if (!res.ok) {
            console.warn('[refreshAccessToken] Falhou:', await res.text());
            return null;
        }

        const data = await res.json();
        return data.access_token || null;
    } catch (err) {
        console.warn('[refreshAccessToken] Erro:', err);
        return null;
    }
}

/**
 * Busca dados de uma planilha Google Sheets usando um access_token.
 */
async function fetchSheetValues(spreadsheetId: string, rangeWithSheet: string, accessToken: string): Promise<Response> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(rangeWithSheet)}`;
    return fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

/**
 * Fallback client-side: busca dados diretamente da Google Sheets API
 * usando o access_token armazenado. Se expirado, tenta refresh automático.
 */
async function fetchClientSide(dashboardType: string): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Buscar conexão com tokens
    const { data: conn, error: connError } = await supabase
        .from('google_sheets_connections')
        .select('id, spreadsheet_id, sheet_name, range, access_token, refresh_token')
        .eq('user_id', user.id)
        .eq('dashboard_type', dashboardType)
        .eq('is_active', true)
        .maybeSingle();

    if (connError || !conn) {
        throw new Error('Nenhuma conexão ativa com Google Sheets para esta aba.');
    }

    if (!conn.spreadsheet_id) {
        throw new Error('Conexão sem spreadsheet_id. Reconecte a planilha em Configurações > Histórico de Dados.');
    }

    if (!conn.access_token) {
        throw new Error('Conexão sem access token. Reconecte a planilha.');
    }

    const sheetName = conn.sheet_name || 'Sheet1';
    const rawRange = conn.range || 'A1:Z1000';
    const rangeWithSheet = rawRange.includes('!') ? rawRange : `${sheetName}!${rawRange}`;

    // 1. Tentar buscar com o access_token atual
    let response = await fetchSheetValues(conn.spreadsheet_id, rangeWithSheet, conn.access_token);

    // 2. Se 401 (token expirado), tentar refresh automático
    if (response.status === 401 && conn.refresh_token) {
        console.log('[fetchClientSide] Token expirado, tentando refresh...');
        const newAccessToken = await refreshAccessToken(conn.refresh_token);

        if (newAccessToken) {
            // Salvar novo token no Supabase
            await supabase
                .from('google_sheets_connections')
                .update({ access_token: newAccessToken })
                .eq('id', conn.id);

            // Tentar novamente com o novo token
            response = await fetchSheetValues(conn.spreadsheet_id, rangeWithSheet, newAccessToken);
        } else {
            throw new Error('Token expirado e não foi possível renovar. Reconecte a planilha em Configurações > Histórico de Dados.');
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Sheets API error (${response.status}): ${errorText}`);
    }

    const valuesData = await response.json();
    const values = valuesData.values || [];
    const rows = toObjects(values);

    // Salvar no saved_dashboards
    if (rows.length > 0) {
        await saveDashboardData(user.id, dashboardType as any, rows, 3);

        // Atualizar last_sync na conexão
        await supabase
            .from('google_sheets_connections')
            .update({ last_sync: new Date().toISOString() })
            .eq('id', conn.id);
    }

    return rows;
}

/**
 * Busca os dados atuais do Google Sheets conectado para o dashboard e retorna os dados.
 * Tenta via edge function primeiro; se falhar (CORS, deploy, etc), usa fallback client-side.
 */
export async function fetchGoogleSheetsData(dashboardType: string): Promise<any[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
        throw new Error('Usuário não autenticado');
    }

    // Tentar via edge function
    try {
        const { data, error } = await supabase.functions.invoke('google-sheets-fetch-one', {
            body: { dashboard_type: dashboardType },
        });

        if (error) throw error;

        if (!data?.success) {
            throw new Error(data?.error || 'Edge function retornou erro');
        }

        return Array.isArray(data.data) ? data.data : [];
    } catch (edgeFnError) {
        console.warn('[fetchGoogleSheetsData] Edge function falhou, tentando fallback client-side:', edgeFnError);
    }

    // Fallback: buscar diretamente via client-side (com auto-refresh de token)
    return fetchClientSide(dashboardType);
}
