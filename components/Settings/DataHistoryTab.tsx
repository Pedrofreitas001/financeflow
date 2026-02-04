// components/Settings/DataHistoryTab.tsx
// Aba de histórico de dados com últimos 3 Excel + Google Sheets

import { useEffect, useState } from 'react';
import { getExcelHistory, reuploadExcelFromHistory, deleteExcelUpload, ExcelUpload } from '@/utils/excelUploadManager';
import { supabase } from '@/lib/supabase';

interface DataHistoryTabProps {
    userId: string;
    dashboardType: string;
}

interface GoogleSheetConnection {
    id: string;
    spreadsheetName: string;
    sheetName: string;
    lastSync: string | null;
    isActive: boolean;
    syncIntervalSeconds: number;
}

export default function DataHistoryTab({ userId, dashboardType }: DataHistoryTabProps) {
    const [excelHistory, setExcelHistory] = useState<ExcelUpload[]>([]);
    const [googleConnection, setGoogleConnection] = useState<GoogleSheetConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

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
                .select('id, spreadsheet_name, sheet_name, last_sync, is_active, sync_interval_seconds')
                .eq('user_id', userId)
                .eq('dashboard_type', dashboardType)
                .single();

            if (googleData) {
                setGoogleConnection({
                    id: googleData.id,
                    spreadsheetName: googleData.spreadsheet_name,
                    sheetName: googleData.sheet_name,
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

    if (loading) {
        return (
            <div className="text-slate-400 text-sm py-3">Carregando...</div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Google Sheets Connection */}
            {googleConnection && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
                    <div className="flex items-start gap-2">
                        <div className="text-blue-400 mt-0.5">🔗</div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-100 text-sm mb-1">Google Sheets</h3>
                            <div className="text-xs text-slate-300 space-y-0.5">
                                <p>{googleConnection.spreadsheetName}</p>
                                <p>{googleConnection.sheetName}</p>
                                {googleConnection.lastSync && (
                                    <p className="text-slate-400">
                                        Sincronizado: {new Date(googleConnection.lastSync).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ${googleConnection.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                            {googleConnection.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>
            )}

            {/* Excel Uploads History */}
            <div>
                <h3 className="font-semibold text-slate-100 text-sm mb-2">Arquivos Excel (Últimos 3)</h3>

                {excelHistory.length === 0 ? (
                    <div className="bg-slate-800/30 border border-slate-700 rounded p-3 text-center text-slate-400 text-xs">
                        Nenhum arquivo
                    </div>
                ) : (
                    <div className="space-y-2">
                        {excelHistory.map((file, index) => (
                            <div
                                key={file.id}
                                className="bg-slate-800/50 border border-slate-700 rounded p-2 hover:bg-slate-800/70 transition flex items-start justify-between gap-2"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold items-center justify-center flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <p className="font-medium text-slate-100 text-xs truncate">{file.fileName}</p>
                                    </div>
                                    <p className="text-xs text-slate-400">📊 {file.rowCount} linhas • 💾 {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.uploadDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => handleReupload(file.id)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded text-xs transition">↻</button>
                                    <button onClick={() => handleDelete(file.id)} disabled={deleting === file.id} className="p-1 text-red-400 hover:bg-red-500/20 rounded text-xs disabled:opacity-50 transition">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
