// components/UpdateFromSheetsButton.tsx
// Botão "Atualizar" que puxa a última versão do Google Sheets conectado para esta aba.

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { hasGoogleSheetsConnection, fetchGoogleSheetsData } from '@/utils/googleSheetsFetchOne';

interface UpdateFromSheetsButtonProps {
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';
    onDataLoaded: (data: any[]) => void;
    onError?: (message: string) => void;
    onSuccess?: () => void;
    disabled?: boolean;
}

export default function UpdateFromSheetsButton({
    dashboardType,
    onDataLoaded,
    onError,
    onSuccess,
    disabled = false,
}: UpdateFromSheetsButtonProps) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [hasConnection, setHasConnection] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function check() {
            if (!user?.id) {
                setHasConnection(false);
                setChecking(false);
                return;
            }
            try {
                const ok = await hasGoogleSheetsConnection(user.id, dashboardType);
                if (!cancelled) setHasConnection(ok);
            } catch {
                if (!cancelled) setHasConnection(false);
            } finally {
                if (!cancelled) setChecking(false);
            }
        }
        check();
        return () => { cancelled = true; };
    }, [user?.id, dashboardType]);

    const handleClick = async () => {
        if (!hasConnection || loading || disabled) return;
        setLoading(true);
        try {
            const data = await fetchGoogleSheetsData(dashboardType);
            onDataLoaded(data);
            onSuccess?.();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao atualizar';
            onError?.(msg);
        } finally {
            setLoading(false);
        }
    };

    const isDark = theme === 'dark';
    const canClick = !checking && hasConnection && !loading && !disabled;

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={!canClick}
            title={!hasConnection && !checking ? 'Conecte o Google Sheets em Configurações > Histórico de Dados' : undefined}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200
                ${!canClick
                    ? isDark
                        ? 'bg-gray-700/80 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDark
                        ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
        >
            <span className="material-symbols-outlined text-base">
                {loading ? 'progress_activity' : 'sync'}
            </span>
            {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
    );
}
