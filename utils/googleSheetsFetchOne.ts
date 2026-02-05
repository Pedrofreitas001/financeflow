// utils/googleSheetsFetchOne.ts
// Chama a edge function para buscar a última versão do Google Sheets conectado para um dashboard.

import { supabase } from '@/lib/supabase';

export type DashboardType = 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';

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
 * Busca os dados atuais do Google Sheets conectado para o dashboard e retorna os dados.
 * Também persiste no saved_dashboards (últimas 3 versões).
 * Se a edge function não estiver disponível ou falhar, lança erro amigável.
 */
export async function fetchGoogleSheetsData(dashboardType: string): Promise<any[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
        throw new Error('Usuário não autenticado');
    }

    try {
        const { data, error } = await supabase.functions.invoke('google-sheets-fetch-one', {
            body: { dashboard_type: dashboardType },
        });

        if (error) {
            throw new Error(error.message || 'Erro ao buscar dados do Google Sheets. Verifique se a edge function está publicada no Supabase.');
        }

        if (!data?.success) {
            throw new Error(data?.error || 'Nenhuma conexão ativa para esta aba. Configure em Configurações > Histórico de Dados.');
        }

        return Array.isArray(data.data) ? data.data : [];
    } catch (e) {
        if (e instanceof Error) throw e;
        throw new Error('Falha ao atualizar do Google Sheets. Tente novamente ou configure a edge function no Supabase.');
    }
}
