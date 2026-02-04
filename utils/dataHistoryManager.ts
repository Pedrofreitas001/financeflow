// utils/dataHistoryManager.ts
// Gerenciador de histórico de dados carregados

import { supabase } from '@/lib/supabase';

export type DataSource = 'manual' | 'google_sheets' | 'api';
export type DashboardType = 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';

export interface DataHistoryEntry {
    id?: string;
    user_id?: string;
    dashboard_type: DashboardType;
    source: DataSource;
    file_name?: string;
    row_count: number;
    columns?: string[];
    file_size?: number;
    created_at?: string;
    updated_at?: string;
    metadata?: Record<string, any>;
}

/**
 * Salvar dados no histórico
 */
export async function saveDataToHistory(
    userId: string,
    dashboardType: DashboardType,
    source: DataSource,
    fileName: string | undefined,
    rowCount: number,
    columns: string[] = [],
    fileSize?: number,
    metadata?: Record<string, any>
): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        console.log(`[dataHistoryManager] Salvando histórico: ${dashboardType} via ${source}`);

        const { data, error } = await supabase
            .from('excel_uploads')
            .insert({
                user_id: userId,
                dashboard_type: dashboardType,
                source: source,
                file_name: fileName || `${source}_${dashboardType}_${new Date().toISOString()}`,
                row_count: rowCount,
                columns: columns,
                file_size: fileSize || 0,
                metadata: metadata || {},
            })
            .select('id')
            .single();

        if (error) {
            console.error('[dataHistoryManager] Erro ao salvar histórico:', error);
            return {
                success: false,
                error: error.message,
            };
        }

        console.log('[dataHistoryManager] Histórico salvo com sucesso:', data.id);
        return {
            success: true,
            id: data.id,
        };
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('[dataHistoryManager] Erro:', errorMsg);
        return {
            success: false,
            error: errorMsg,
        };
    }
}

/**
 * Obter histórico de dados do usuário
 */
export async function getDataHistory(userId: string, dashboardType?: DashboardType) {
    try {
        let query = supabase
            .from('excel_uploads')
            .select('*')
            .eq('user_id', userId);

        if (dashboardType) {
            query = query.eq('dashboard_type', dashboardType);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[dataHistoryManager] Erro ao buscar histórico:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[dataHistoryManager] Erro:', err);
        return [];
    }
}

/**
 * Excluir entrada do histórico
 */
export async function deleteHistoryEntry(entryId: string) {
    try {
        const { error } = await supabase
            .from('excel_uploads')
            .delete()
            .eq('id', entryId);

        if (error) {
            console.error('[dataHistoryManager] Erro ao excluir:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        return { success: false, error: errorMsg };
    }
}

/**
 * Obter últimas 3 uploads por dashboard (para Settings)
 */
export async function getLatestUploads(userId: string, limit: number = 3) {
    try {
        const { data, error } = await supabase
            .from('excel_uploads')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[dataHistoryManager] Erro:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[dataHistoryManager] Erro:', err);
        return [];
    }
}

/**
 * Obter estatísticas de uploads
 */
export async function getUploadStats(userId: string) {
    try {
        const { data, error } = await supabase
            .from('excel_uploads')
            .select('source, dashboard_type')
            .eq('user_id', userId);

        if (error) {
            console.error('[dataHistoryManager] Erro:', error);
            return {};
        }

        const stats = {
            total: data?.length || 0,
            by_source: { manual: 0, google_sheets: 0, api: 0 },
            by_type: {
                dashboard: 0,
                despesas: 0,
                dre: 0,
                cashflow: 0,
                indicadores: 0,
                orcamento: 0,
                balancete: 0,
            },
        };

        data?.forEach((item: any) => {
            if (item.source in stats.by_source) {
                stats.by_source[item.source as DataSource]++;
            }
            if (item.dashboard_type in stats.by_type) {
                stats.by_type[item.dashboard_type as DashboardType]++;
            }
        });

        return stats;
    } catch (err) {
        console.error('[dataHistoryManager] Erro:', err);
        return {};
    }
}
