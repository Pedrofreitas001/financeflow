// hooks/useUsageLimits.ts
// Hook para verificar se usuário atingiu limite de uso do seu plano

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UsageData {
    excelUploads: number;
    excelUploadsLimit: number;
    aiAnalyses: number;
    aiAnalysesLimit: number;
    pdfExports: number;
    pdfExportsLimit: number;
    canUploadExcel: boolean;
    canAnalyzeAI: boolean;
    canExportPDF: boolean;
}

const LIMITS: Record<string, Record<string, number>> = {
    free: {
        excelUploads: 0,
        aiAnalyses: 0,
        pdfExports: 0
    },
    premium: {
        excelUploads: 999999,
        aiAnalyses: 5,
        pdfExports: 5
    },
    diamond: {
        excelUploads: 999999,
        aiAnalyses: 999999,
        pdfExports: 999999
    }
};

export function useUsageLimits(userId: string, plan: 'free' | 'premium' | 'diamond') {
    const [usage, setUsage] = useState<UsageData>({
        excelUploads: 0,
        excelUploadsLimit: LIMITS[plan].excelUploads,
        aiAnalyses: 0,
        aiAnalysesLimit: LIMITS[plan].aiAnalyses,
        pdfExports: 0,
        pdfExportsLimit: LIMITS[plan].pdfExports,
        canUploadExcel: true,
        canAnalyzeAI: true,
        canExportPDF: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsage();
    }, [userId, plan]);

    async function loadUsage() {
        try {
            setLoading(true);

            // Contar ações este mês
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { data: logs } = await supabase
                .from('usage_logs')
                .select('action_type')
                .eq('user_id', userId)
                .gte('created_at', startOfMonth.toISOString());

            const logList = logs || [];
            const excelCount = logList.filter((l: any) => l.action_type === 'excel_upload').length;
            const aiCount = logList.filter((l: any) => l.action_type === 'ai_analysis').length;
            const pdfCount = logList.filter((l: any) => l.action_type === 'pdf_export').length;

            const limits = LIMITS[plan];

            setUsage({
                excelUploads: excelCount,
                excelUploadsLimit: limits.excelUploads,
                aiAnalyses: aiCount,
                aiAnalysesLimit: limits.aiAnalyses,
                pdfExports: pdfCount,
                pdfExportsLimit: limits.pdfExports,
                canUploadExcel: excelCount < limits.excelUploads,
                canAnalyzeAI: aiCount < limits.aiAnalyses,
                canExportPDF: pdfCount < limits.pdfExports
            });
        } catch (error) {
            console.error('Erro ao carregar limites de uso:', error);
        } finally {
            setLoading(false);
        }
    }

    return { ...usage, loading, refresh: loadUsage };
}
