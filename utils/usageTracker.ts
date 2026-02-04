// utils/usageTracker.ts
// Utilitário para registrar uso de ações no plano

import { supabase } from '@/lib/supabase';

export type ActionType = 'excel_upload' | 'ai_analysis' | 'pdf_export' | 'google_sheets_sync';

export async function logUsage(
    userId: string,
    actionType: ActionType,
    metadata?: Record<string, any>
): Promise<boolean> {
    try {
        const { error } = await supabase.from('usage_logs').insert({
            user_id: userId,
            action_type: actionType,
            metadata: metadata || {}
        });

        if (error) {
            console.error('Erro ao registrar uso:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao fazer log de uso:', error);
        return false;
    }
}

export async function canPerformAction(
    userId: string,
    actionType: ActionType,
    plan: 'free' | 'premium' | 'diamond'
): Promise<boolean> {
    // Diamond users podem fazer tudo ilimitado
    if (plan === 'diamond') return true;

    const limits: Record<string, Record<string, number>> = {
        free: {
            excel_upload: 1,
            ai_analysis: 3,
            pdf_export: 1,
            google_sheets_sync: 0 // free users can't use Google Sheets
        },
        premium: {
            excel_upload: 10,
            ai_analysis: 50,
            pdf_export: 20,
            google_sheets_sync: 1
        }
    };

    const planLimits = limits[plan];
    const limit = planLimits[actionType];

    if (limit === 0) return false; // Action not allowed for this plan

    // Contar ações este mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: logs, error } = await supabase
        .from('usage_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', actionType)
        .gte('created_at', startOfMonth.toISOString());

    if (error) {
        console.error('Erro ao verificar uso:', error);
        return false;
    }

    const currentUsage = logs?.length || 0;
    return currentUsage < limit;
}

export async function getUsageStatus(
    userId: string,
    plan: 'free' | 'premium' | 'diamond'
): Promise<Record<string, { used: number; limit: number; canUse: boolean }>> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: logs } = await supabase
        .from('usage_logs')
        .select('action_type')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

    const logList = logs || [];

    const limits: Record<string, Record<string, number>> = {
        free: {
            excel_upload: 1,
            ai_analysis: 3,
            pdf_export: 1
        },
        premium: {
            excel_upload: 10,
            ai_analysis: 50,
            pdf_export: 20
        },
        diamond: {
            excel_upload: 999999,
            ai_analysis: 999999,
            pdf_export: 999999
        }
    };

    const planLimits = limits[plan];
    const actions = ['excel_upload', 'ai_analysis', 'pdf_export'];

    const status: Record<string, { used: number; limit: number; canUse: boolean }> = {};

    for (const action of actions) {
        const used = logList.filter((l: any) => l.action_type === action).length;
        const limit = planLimits[action];
        status[action] = {
            used,
            limit,
            canUse: used < limit
        };
    }

    return status;
}
