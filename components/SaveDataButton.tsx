import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { saveDashboardData } from '@/utils/savedDashboardManager';
import { saveDataToHistory } from '@/utils/dataHistoryManager';

interface SaveDataButtonProps {
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'balancete';
    data: any[];
    disabled?: boolean;
    onSaveComplete?: () => void;
    onError?: (error: string) => void;
}

// Validar dados conforme esperado pelos contextos
function validateDataForDashboard(data: any[]): any[] {
    if (!Array.isArray(data)) return [];

    return data.filter(row => {
        try {
            return row && row.Ano && row.Mes && row.Categoria && row.Empresa && row.Valor !== undefined;
        } catch {
            return false;
        }
    });
}

function validateDataForDespesas(data: any[]): any[] {
    if (!Array.isArray(data)) return [];

    return data.filter(row => {
        try {
            return row && row.Ano && row.Mes && row.Categoria && row.Empresa && row.Valor !== undefined;
        } catch {
            return false;
        }
    });
}

const SaveDataButton: React.FC<SaveDataButtonProps> = ({
    dashboardType,
    data,
    disabled = false,
    onSaveComplete,
    onError
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (data.length === 0) {
            onError?.('Nenhum dado para salvar');
            return;
        }

        setIsSaving(true);

        try {
            // Validar dados conforme o tipo de dashboard
            let validatedData: any[] = [];

            if (dashboardType === 'dashboard') {
                validatedData = validateDataForDashboard(data);
                console.log(`[SaveDataButton] Dashboard: ${data.length} registros originais → ${validatedData.length} válidos`);
            } else if (dashboardType === 'despesas') {
                validatedData = validateDataForDespesas(data);
                console.log(`[SaveDataButton] Despesas: ${data.length} registros originais → ${validatedData.length} válidos`);
            } else {
                // Para outros tipos (dre, cashflow, etc), salvar como estão por enquanto
                validatedData = data;
                console.log(`[SaveDataButton] ${dashboardType}: ${data.length} registros (sem validação)`);
            }

            if (validatedData.length === 0) {
                onError?.(`Nenhum dado válido encontrado para ${dashboardType}. Verifique se todos os registros têm os campos obrigatórios: Ano, Mês, Categoria, Empresa, Valor`);
                setIsSaving(false);
                return;
            }

            // Log de amostra dos dados
            if (validatedData.length > 0) {
                console.log('[SaveDataButton] Amostra do primeiro registro:', validatedData[0]);
            }

            // Pegar usuário autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                onError?.('Você precisa estar logado para salvar');
                setIsSaving(false);
                return;
            }

            // Salvar dados validados no Supabase
            const result = await saveDashboardData(user.id, dashboardType, validatedData);

            if (!result.success) {
                onError?.(result.error || 'Erro ao salvar no Supabase');
                setIsSaving(false);
                return;
            }

            // Salvar também no histórico
            const columns = validatedData.length > 0 ? Object.keys(validatedData[0]) : [];
            const { error: historyError } = await supabase
                .from('excel_uploads')
                .insert({
                    user_id: user.id,
                    dashboard_type: dashboardType,
                    source: 'manual_save',
                    filename: `${dashboardType}_saved_${new Date().toISOString().split('T')[0]}.json`,
                    row_count: validatedData.length,
                    columns: columns
                });

            if (historyError) {
                console.warn('Erro ao salvar histórico:', historyError);
                // Não bloqueia o fluxo se o histórico falhar
            }

            onSaveComplete?.();
            setIsSaving(false);
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            onError?.(error.message || 'Erro desconhecido');
            setIsSaving(false);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={disabled || isSaving || data.length === 0}
            className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold
                transition-all duration-200 w-full
                ${data.length === 0 || disabled || isSaving
                    ? isDark
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                }
            `}
        >
            {isSaving ? (
                <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Salvando...
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined">save</span>
                    Salvar Dados
                </>
            )}
        </button>
    );
};

export default SaveDataButton;
