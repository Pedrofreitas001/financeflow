// components/Settings/SavedDashboardHistoryViewer.tsx
// Visualiza versoes salvas e permite restaurar

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { saveDashboardData, loadSavedDashboard } from '@/utils/savedDashboardManager';
import { useFinance } from '@/context/FinanceContext';
import { useDespesas } from '@/context/DespesasContext';
import { useDRE } from '@/context/DREContext';
import { useCashFlow } from '@/context/CashFlowContext/CashFlowContext';
import { useIndicadores } from '@/context/IndicadoresContext/IndicadoresContext';
import { useOrcamento } from '@/context/OrcamentoContext/OrcamentoContext';
import { useBalancete } from '@/context/BalanceteContext';

type DashboardType = 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';

interface SavedVersion {
    id: string;
    data: any[];
    row_count: number;
    created_at: string;
}

interface SavedDashboardHistoryViewerProps {
    variant?: 'light' | 'dark';
    /** Se informado, o tipo de dashboard é controlado pelo pai (ex.: mesma aba que Google Sheets). */
    dashboardType?: DashboardType;
    onDashboardTypeChange?: (type: DashboardType) => void;
}

export default function SavedDashboardHistoryViewer({ variant, dashboardType: controlledType, onDashboardTypeChange }: SavedDashboardHistoryViewerProps) {
    const [internalType, setInternalType] = useState<DashboardType>('dashboard');
    const dashboardType = controlledType ?? internalType;
    const setDashboardType = onDashboardTypeChange ?? setInternalType;
    const [versions, setVersions] = useState<SavedVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const { theme } = useTheme();
    const isDark = variant ? variant === 'dark' : theme === 'dark';

    const { carregarDados } = useFinance();
    const { carregarDadosDespesas } = useDespesas();
    const { setDados: setDreDados } = useDRE();
    const { setDados: setCashFlowDados } = useCashFlow();
    const { setDados: setIndicadoresDados } = useIndicadores();
    const { setDados: setOrcamentoDados } = useOrcamento();
    const { setDados: setBalanceteDados } = useBalancete();

    const dashboardLabels = useMemo(() => ({
        dashboard: 'Dashboard',
        despesas: 'Despesas',
        dre: 'DRE',
        cashflow: 'Cash Flow',
        indicadores: 'Indicadores',
        orcamento: 'Orcamento',
        balancete: 'Balancete',
    }), []);

    useEffect(() => {
        const loadVersions = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setVersions([]);
                    return;
                }

                const { data, error } = await supabase
                    .from('saved_dashboards')
                    .select('id, data, row_count, created_at')
                    .eq('user_id', user.id)
                    .eq('dashboard_type', dashboardType)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) {
                    console.error('Erro ao carregar versoes:', error);
                    setVersions([]);
                    return;
                }

                setVersions(data || []);
            } finally {
                setLoading(false);
            }
        };

        loadVersions();
    }, [dashboardType]);

    const applyDataToContext = (type: DashboardType, data: any[]) => {
        if (type === 'dashboard') {
            carregarDados(data);
            return;
        }
        if (type === 'despesas') {
            carregarDadosDespesas(data as any);
            return;
        }
        if (type === 'dre') {
            setDreDados(data[0] as any);
            return;
        }
        if (type === 'cashflow') {
            setCashFlowDados(data as any);
            return;
        }
        if (type === 'indicadores') {
            setIndicadoresDados(data as any);
            return;
        }
        if (type === 'orcamento') {
            setOrcamentoDados(data as any);
            return;
        }
        if (type === 'balancete') {
            setBalanceteDados(data as any);
        }
    };

    const handleRestore = async (version: SavedVersion) => {
        if (!confirm('Restaurar esta versao? Isso criara uma nova versao ativa.')) return;

        setRestoring(version.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Voce precisa estar logado para restaurar');
                return;
            }

            const result = await saveDashboardData(user.id, dashboardType, version.data, 3);
            if (!result.success) {
                alert(result.error || 'Erro ao restaurar versao');
                return;
            }

            applyDataToContext(dashboardType, version.data);

            const latest = await loadSavedDashboard(user.id, dashboardType);
            if (latest) {
                applyDataToContext(dashboardType, latest);
            }

            alert('Versao restaurada com sucesso');
        } finally {
            setRestoring(null);
        }
    };

    const handleDelete = async (versionId: string) => {
        if (!confirm('Excluir esta versao do historico e do Supabase?')) return;

        setDeleting(versionId);
        try {
            const { error } = await supabase
                .from('saved_dashboards')
                .delete()
                .eq('id', versionId);

            if (error) {
                alert(error.message || 'Erro ao excluir versao');
                return;
            }

            setVersions((prev) => prev.filter((v) => v.id !== versionId));
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            {controlledType === undefined && (
                <div className="flex flex-wrap items-center gap-3">
                    <label className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Dashboard</label>
                    <select
                        value={dashboardType}
                        onChange={(e) => setDashboardType(e.target.value as DashboardType)}
                        className={`${isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-200'
                            : 'bg-white border-gray-300 text-gray-900'
                            } border rounded-lg px-3 py-2 text-sm`}
                    >
                        {Object.entries(dashboardLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <div className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm`}>Carregando versoes...</div>
            ) : versions.length === 0 ? (
                <div className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm`}>Nenhuma versao salva ainda</div>
            ) : (
                <div className="space-y-2">
                    {versions.map((version, index) => (
                        <div
                            key={version.id}
                            className={`${isDark
                                ? 'bg-slate-800/50 border-slate-700'
                                : 'bg-white border-gray-200'
                                } border rounded p-3 flex items-start justify-between gap-3 shadow-sm`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold items-center justify-center flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                                        {dashboardLabels[dashboardType]}
                                    </span>
                                </div>
                                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} flex items-center gap-3`}>
                                    <span>{version.row_count} linhas</span>
                                    <span>
                                        {new Date(version.created_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleRestore(version)}
                                    disabled={restoring === version.id}
                                    className={`${isDark
                                        ? 'bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30'
                                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                        } px-3 py-1 text-xs border rounded transition-colors disabled:opacity-50`}
                                >
                                    {restoring === version.id ? 'Restaurando...' : 'Restaurar'}
                                </button>
                                <button
                                    onClick={() => handleDelete(version.id)}
                                    disabled={deleting === version.id}
                                    className={`${isDark
                                        ? 'bg-red-600/20 text-red-300 border-red-600/30 hover:bg-red-600/30'
                                        : 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                                        } px-3 py-1 text-xs border rounded transition-colors disabled:opacity-50`}
                                >
                                    {deleting === version.id ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
