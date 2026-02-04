// components/Settings/DataHistoryViewer.tsx
// Visualiza histórico de uploads na aba de Settings

import React, { useEffect, useState } from 'react';
import { getDataHistory, deleteHistoryEntry, type DataHistoryEntry } from '@/utils/dataHistoryManager';
import { supabase } from '@/lib/supabase';

export default function DataHistoryViewer() {
    const [history, setHistory] = useState<DataHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const data = await getDataHistory(user.id);
            setHistory(data);
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este arquivo do histórico?')) return;

        setDeleting(id);
        try {
            const result = await deleteHistoryEntry(id);
            if (result.success) {
                setHistory(history.filter(h => h.id !== id));
                alert('Arquivo removido do histórico');
            } else {
                alert('Erro ao remover arquivo');
            }
        } finally {
            setDeleting(null);
        }
    };

    const getSourceLabel = (source: string) => {
        const labels: Record<string, string> = {
            manual: 'Upload Manual',
            google_sheets: 'Google Sheets',
            api: 'API',
        };
        return labels[source] || source;
    };

    const getDashboardLabel = (type: string) => {
        const labels: Record<string, string> = {
            dashboard: 'Dashboard',
            despesas: 'Despesas',
            dre: 'DRE',
            cashflow: 'Cash Flow',
            indicadores: 'Indicadores',
            orcamento: 'Orçamento',
            balancete: 'Balancete',
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-slate-400">Carregando histórico...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-slate-400">Nenhum arquivo carregado ainda</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((entry) => (
                <div
                    key={entry.id}
                    className="flex items-start justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">
                                {getDashboardLabel(entry.dashboard_type)}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-700 text-xs text-slate-300 rounded">
                                {getSourceLabel(entry.source)}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{entry.row_count} linhas</span>
                            {entry.columns && entry.columns.length > 0 && (
                                <span>{entry.columns.length} colunas</span>
                            )}
                            {entry.created_at && (
                                <span>
                                    {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            )}
                        </div>
                        {entry.file_name && (
                            <p className="text-xs text-slate-500 mt-1 truncate">{entry.file_name}</p>
                        )}
                    </div>

                    <button
                        onClick={() => entry.id && handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="ml-2 px-2 py-1 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 rounded transition-colors disabled:opacity-50"
                    >
                        {deleting === entry.id ? 'Removendo...' : 'Remover'}
                    </button>
                </div>
            ))}
        </div>
    );
}
