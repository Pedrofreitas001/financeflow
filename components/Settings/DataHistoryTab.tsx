// components/Settings/DataHistoryTab.tsx
// Aba de histórico de dados com últimos 3 Excel + Google Sheets

import { useEffect, useState } from 'react';
import { getExcelHistory, reuploadExcelFromHistory, deleteExcelUpload, ExcelUpload } from '@/utils/excelUploadManager';
import { supabase } from '@/lib/supabase';
import GoogleSheetConnector from '@/components/GoogleSheetConnector';

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
    const [excelHistory, setExcelHistory] = useState<ExcelUpload[]>([]);
    const [googleConnection, setGoogleConnection] = useState<GoogleSheetConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [showConnector, setShowConnector] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [userId, dashboardType]);

    async function loadHistory() {
        try {
            setLoading(true);

            // Buscar últimos 3 uploads de Excel
            const excelData = await getExcelHistory(userId, dashboardType);
            setExcelHistory(excelData);

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

    async function handleReupload(fileId: string) {
        const result = await reuploadExcelFromHistory(userId, fileId);
        if (result.success) {
            alert('Dados recuperados! Agora você pode processar no dashboard.');
            // Aqui você pode emitir evento ou callback para carregar os dados
        }
    }

    async function handleDelete(fileId: string) {
        if (!confirm('Tem certeza que deseja deletar este arquivo?')) return;

        try {
            setDeleting(fileId);
            const success = await deleteExcelUpload(userId, fileId);
            if (success) {
                setExcelHistory(excelHistory.filter(f => f.id !== fileId));
                alert('Arquivo deletado com sucesso');
            }
        } finally {
            setDeleting(null);
        }
    }

    async function handleSyncNow() {
        try {
            setSyncing(true);
            await supabase.functions.invoke('google-sheets-sync');
            await loadHistory();
        } catch (error) {
            console.error('Erro ao sincronizar agora:', error);
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
                            onClick={handleSyncNow}
                            disabled={syncing}
                            className={`${isLight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'} text-xs px-3 py-1.5 rounded font-semibold transition disabled:opacity-60`}
                        >
                            {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
                        </button>
                        {googleConnection.isActive && (
                            <button
                                onClick={handleDisconnect}
                                disabled={toggling}
                                className={`${isLight ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500/20 text-red-200 hover:bg-red-500/30'} text-xs px-3 py-1.5 rounded font-semibold transition disabled:opacity-60`}
                            >
                                Encerrar conexão
                            </button>
                        )}
                    </div>

                    <p className={`mt-2 text-[11px] ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                        Atualização automática: ao login
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
                            onClick={() => setShowConnector((prev) => !prev)}
                            className={`${isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-300 hover:bg-blue-500/20'} text-xs px-3 py-1.5 rounded font-semibold transition`}
                        >
                            {showConnector ? 'Fechar' : 'Conectar'}
                        </button>
                    </div>

                    {showConnector && (
                        <div className="mt-3">
                            <GoogleSheetConnector
                                userId={userId}
                                initialDashboardType={dashboardType as any}
                                variant={isLight ? 'light' : 'dark'}
                                onConnected={async () => {
                                    setShowConnector(false);
                                    await loadHistory();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Excel Uploads History */}
            <div>
                <h3 className={`font-semibold text-sm mb-2 ${isLight ? 'text-gray-900' : 'text-slate-100'}`}>Arquivos Excel (Ultimos 3)</h3>

                {excelHistory.length === 0 ? (
                    <div className={`${isLight ? 'bg-white border border-gray-200 text-gray-500' : 'bg-slate-800/30 border border-slate-700 text-slate-400'} rounded p-3 text-center text-xs`}>
                        Nenhum arquivo
                    </div>
                ) : (
                    <div className="space-y-2">
                        {excelHistory.map((file, index) => (
                            <div
                                key={file.id}
                                className={`${isLight ? 'bg-white border border-gray-200 hover:bg-gray-50' : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70'} rounded p-2 transition flex items-start justify-between gap-2`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold items-center justify-center flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <p className={`font-medium text-xs truncate ${isLight ? 'text-gray-900' : 'text-slate-100'}`}>{file.fileName}</p>
                                    </div>
                                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>📊 {file.rowCount} linhas • 💾 {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.uploadDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => handleReupload(file.id)} className={`${isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-400 hover:bg-blue-500/20'} p-1 rounded text-xs transition`}>↻</button>
                                    <button onClick={() => handleDelete(file.id)} disabled={deleting === file.id} className={`${isLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/20'} p-1 rounded text-xs disabled:opacity-50 transition`}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
