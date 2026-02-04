import { supabase } from '@/lib/supabase';

export interface SavedDashboardData {
    id: string;
    user_id: string;
    dashboard_type: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'balancete';
    data: any[];
    row_count: number;
    created_at: string;
    updated_at: string;
}

/**
 * Carrega dados salvos de um dashboard específico
 * @param userId - ID do usuário
 * @param dashboardType - Tipo do dashboard
 * @returns Dados salvos ou null se não encontrado
 */
export async function loadSavedDashboard(
    userId: string,
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'balancete'
): Promise<any[] | null> {
    try {
        const { data, error } = await supabase
            .from('saved_dashboards')
            .select('data, row_count, updated_at')
            .eq('user_id', userId)
            .eq('dashboard_type', dashboardType)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Nenhum dado salvo encontrado - normal
                console.log(`[loadSavedDashboard] Nenhum dado salvo para ${dashboardType}`);
                return null;
            }
            console.error('[loadSavedDashboard] Erro ao carregar:', error);
            return null;
        }

        if (data && data.data) {
            console.log(`[loadSavedDashboard] ✅ ${data.row_count} linhas carregadas de ${dashboardType} (salvo em ${new Date(data.updated_at).toLocaleString()})`);
            return data.data;
        }

        return null;
    } catch (error) {
        console.error('[loadSavedDashboard] Erro:', error);
        return null;
    }
}

/**
 * Salva dados de um dashboard
 * @param userId - ID do usuário
 * @param dashboardType - Tipo do dashboard
 * @param data - Dados a salvar
 * @returns Sucesso ou erro
 */
export async function saveDashboardData(
    userId: string,
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'balancete',
    data: any[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('saved_dashboards')
            .upsert({
                user_id: userId,
                dashboard_type: dashboardType,
                data: data,
                row_count: data.length,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,dashboard_type'
            });

        if (error) {
            console.error('[saveDashboardData] Erro ao salvar:', error);
            return { success: false, error: error.message };
        }

        console.log(`[saveDashboardData] ✅ ${data.length} linhas salvas para ${dashboardType}`);
        return { success: true };
    } catch (error: any) {
        console.error('[saveDashboardData] Erro:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Deleta dados salvos de um dashboard
 * @param userId - ID do usuário
 * @param dashboardType - Tipo do dashboard
 * @returns Sucesso ou erro
 */
export async function deleteSavedDashboard(
    userId: string,
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'balancete'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('saved_dashboards')
            .delete()
            .eq('user_id', userId)
            .eq('dashboard_type', dashboardType);

        if (error) {
            console.error('[deleteSavedDashboard] Erro ao deletar:', error);
            return { success: false, error: error.message };
        }

        console.log(`[deleteSavedDashboard] ✅ Dados salvos de ${dashboardType} deletados`);
        return { success: true };
    } catch (error: any) {
        console.error('[deleteSavedDashboard] Erro:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Lista todos os dashboards salvos de um usuário
 * @param userId - ID do usuário
 * @returns Lista de dashboards salvos
 */
export async function listSavedDashboards(
    userId: string
): Promise<SavedDashboardData[]> {
    try {
        const { data, error } = await supabase
            .from('saved_dashboards')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('[listSavedDashboards] Erro:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('[listSavedDashboards] Erro:', error);
        return [];
    }
}
