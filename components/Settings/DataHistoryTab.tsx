// components/Settings/DataHistoryTab.tsx
// Aba de histórico de dados com últimos 3 Excel + Google Sheets

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GoogleSheetsSelector } from '@/components/GoogleSheetsSelector';
import { fetchGoogleSheetsData } from '@/utils/googleSheetsFetchOne';

interface DataHistoryTabProps {
    userId: string;
    dashboardType: string;
    variant?: 'light' | 'dark';
}

interface GoogleSheetConnection {
    id: string;
    spreadsheetName: string;
    sheetName: string;
    lastSync: string | null;
    isActive: boolean;
    syncIntervalSeconds: number;
}

export default function DataHistoryTab({ userId, dashboardType, variant = 'dark' }: DataHistoryTabProps) {
    const isLight = variant === 'light';
    const [googleConnection, setGoogleConnection] = useState<GoogleSheetConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [userId, dashboardType]);

    async function loadHistory() {
        try {
            setLoading(true);

            // Buscar conexão Google Sheets se houver
            const { data: googleData } = await supabase
                .from('google_sheets_connections')
                .select('id, spreadsheet_name, sheet_name, sheet_names, last_sync, is_active, sync_interval_seconds')
                .eq('user_id', userId)
                .eq('dashboard_type', dashboardType)
                .single();

            if (googleData) {
                const resolvedSheetName = googleData.sheet_name || (Array.isArray(googleData.sheet_names) ? googleData.sheet_names[0] : '');
                setGoogleConnection({
                    id: googleData.id,
                    spreadsheetName: googleData.spreadsheet_name,
                    sheetName: resolvedSheetName,
                    lastSync: googleData.last_sync,
                    isActive: googleData.is_active,
                    syncIntervalSeconds: googleData.sync_interval_seconds
                });
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSyncNow() {
        if (!googleConnection) return;
        try {
            setSyncing(true);
            await fetchGoogleSheetsData(dashboardType);
            await loadHistory();
            window.dispatchEvent(new CustomEvent('google-sheets-synced', { detail: { dashboardType } }));
        } catch (error) {
            console.error('Erro ao atualizar do Google Sheets:', error);
            throw error;
        } finally {
            setSyncing(false);
        }
    }

    async function handleDisconnect() {
        if (!googleConnection) return;
        if (!confirm('Deseja encerrar a conexão com o Google Sheets?')) return;

        try {
            setToggling(true);
            const { error } = await supabase
                .from('google_sheets_connections')
                .update({ is_active: false })
                .eq('id', googleConnection.id);

            if (!error) {
                setGoogleConnection({ ...googleConnection, isActive: false });
            }
        } finally {
            setToggling(false);
        }
    }

    if (loading) {
        return (
            <div className={`${isLight ? 'text-gray-500' : 'text-slate-400'} text-sm py-3`}>Carregando...</div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Google Sheets Connection */}
            {googleConnection ? (
                <div className={`${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-500/30'} rounded p-3`}>
                    <div className="flex items-start gap-2">
                        <div className={`${isLight ? 'text-blue-600' : 'text-blue-400'} mt-0.5`}>🔗</div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm mb-1 ${isLight ? 'text-gray-900' : 'text-slate-100'}`}>Google Sheets</h3>
                            <div className={`text-xs space-y-0.5 ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>
                                <p>{googleConnection.spreadsheetName}</p>
                                <p>{googleConnection.sheetName}</p>
                                {googleConnection.lastSync && (
                                    <p className={isLight ? 'text-gray-500' : 'text-slate-400'}>
                                        Sincronizado: {new Date(googleConnection.lastSync).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ${googleConnection.isActive
                            ? isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-300'
                            : isLight ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-300'
                            }`}>
                            {googleConnection.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={() => handleSyncNow().catch(() => {})}
                            disabled={syncing}
                            className={`${isLight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'} text-xs px-3 py-1.5 rounded font-semibold transition disabled:opacity-60`}
                        >
                            {syncing ? 'Atualizando...' : 'Atualizar'}
                        </button>
                        {googleConnection.isActive ? (
                            <button
                                onClick={handleDisconnect}
                                disabled={toggling}
                                className={`${isLight ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500/20 text-red-200 hover:bg-red-500/30'} text-xs px-3 py-1.5 rounded font-semibold transition disabled:opacity-60`}
                            >
                                Encerrar conexão
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowSelector(true)}
                                className={`${isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'} text-xs px-3 py-1.5 rounded font-semibold transition`}
                            >
                                Conectar
                            </button>
                        )}
                    </div>

                    <p className={`mt-2 text-[11px] ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                        Clique em &quot;Atualizar&quot; para puxar a última versão da planilha. Os dados também aparecem no dashboard.
                    </p>

                </div>
            ) : (
                <div className={`${isLight ? 'bg-white border border-gray-200' : 'bg-slate-800/30 border border-slate-700'} rounded p-3`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-slate-100'}`}>Google Sheets</p>
                            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>Nenhuma conexão ativa</p>
                        </div>
                        <button
                            onClick={() => setShowSelector(true)}
                            className={`${isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-300 hover:bg-blue-500/20'} text-xs px-3 py-1.5 rounded font-semibold transition`}
                        >
                            Conectar
                        </button>
                    </div>
                </div>
            )}

            <GoogleSheetsSelector
                isOpen={showSelector}
                onClose={() => setShowSelector(false)}
                dashboardType={dashboardType as any}
                onDataLoaded={() => {
                    // Não carregar dados na tela aqui
                }}
                onConnected={async ({ sheetId, sheetName, tabName, range }) => {
                    try {
                        await supabase
                            .from('google_sheets_connections')
                            .upsert({
                                user_id: userId,
                                dashboard_type: dashboardType,
                                spreadsheet_id: sheetId,
                                spreadsheet_name: sheetName,
                                sheet_name: tabName,
                                sheet_names: [tabName],
                                range,
                                is_active: true,
                            }, {
                                onConflict: 'user_id,spreadsheet_id'
                            });
                        await loadHistory();
                        try {
                            await fetchGoogleSheetsData(dashboardType);
                            window.dispatchEvent(new CustomEvent('google-sheets-synced', { detail: { dashboardType } }));
                        } catch (_) {
                            console.warn('Primeira carga do Google Sheets pode ser feita pelo botão Atualizar.');
                        }
                    } finally {
                        setShowSelector(false);
                    }
                }}
            />

        </div>
    );
}
