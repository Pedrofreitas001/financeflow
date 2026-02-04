import { supabase } from '@/lib/supabase';

export interface SavedDashboardData {
    id: string;
    user_id: string;
    dashboard_type: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';
    data: any[];
    row_count: number;
    created_at: string;
    updated_at: string;
}

/**
 * Carrega a última versão salva de um dashboard específico
 * @param userId - ID do usuário
 * @param dashboardType - Tipo do dashboard
 * @returns Dados salvos ou null se não encontrado
 */
export async function loadSavedDashboard(
    userId: string,
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete'
): Promise<any[] | null> {
    try {
        const { data, error } = await supabase
            .from('saved_dashboards')
            .select('data, row_count, updated_at')
            .eq('user_id', userId)
            .eq('dashboard_type', dashboardType)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('[loadSavedDashboard] Erro ao carregar:', error);
            return null;
        }

        const latest = Array.isArray(data) ? data[0] : null;

        if (latest && latest.data) {
            console.log(`[loadSavedDashboard] ✅ ${latest.row_count} linhas carregadas de ${dashboardType} (salvo em ${new Date(latest.updated_at).toLocaleString()})`);
            return latest.data;
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
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete',
    data: any[],
    maxVersions: number = 3
): Promise<{ success: boolean; error?: string }> {
    try {
        const now = new Date().toISOString();
        const { error } = await supabase
            .from('saved_dashboards')
            .insert({
                user_id: userId,
                dashboard_type: dashboardType,
                data: data,
                row_count: data.length,
                created_at: now,
                updated_at: now
            });

        if (error) {
            console.error('[saveDashboardData] Erro ao salvar:', error);
            return { success: false, error: error.message };
        }

        // Limpar versões antigas (mantém apenas as últimas N)
        if (maxVersions > 0) {
            const { data: versions, error: fetchError } = await supabase
                .from('saved_dashboards')
                .select('id')
                .eq('user_id', userId)
                .eq('dashboard_type', dashboardType)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.warn('[saveDashboardData] Não foi possível listar versões antigas:', fetchError);
            } else if (versions && versions.length > maxVersions) {
                const idsToDelete = versions.slice(maxVersions).map((v: any) => v.id);
                if (idsToDelete.length > 0) {
                    const { error: deleteError } = await supabase
                        .from('saved_dashboards')
                        .delete()
                        .in('id', idsToDelete);

                    if (deleteError) {
                        console.warn('[saveDashboardData] Não foi possível remover versões antigas:', deleteError);
                    }
                }
            }
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
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete'
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
            .order('created_at', { ascending: false });

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
