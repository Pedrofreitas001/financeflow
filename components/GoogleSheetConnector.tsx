// components/GoogleSheetConnector.tsx
// Interface para conectar Google Sheets

import { useState } from 'react';
import { getGoogleAuthUrl } from '@/utils/googleSheetsAuth';
import { startRealtimeSync } from '@/utils/googleSheetsSync';
import { supabase } from '@/lib/supabase';
import { Sparkles, Link2, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleSheetConnectorProps {
    userId: string;
    onConnected?: () => void;
}

export default function GoogleSheetConnector({ userId, onConnected }: GoogleSheetConnectorProps) {
    const [loading, setLoading] = useState(false);
    const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
    const [sheetName, setSheetName] = useState('');
    const [range, setRange] = useState('A1:Z1000');
    const [syncInterval, setSyncInterval] = useState(120);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleConnectGoogle = async () => {
        try {
            setLoading(true);
            const authUrl = await getGoogleAuthUrl();
            window.location.href = authUrl;
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Erro ao conectar Google'
            });
        } finally {
            setLoading(false);
        }
    };

    const extractSpreadsheetId = (url: string): string => {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : '';
    };

    const handleStartSync = async () => {
        try {
            setLoading(true);
            const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);

            if (!spreadsheetId || !sheetName) {
                throw new Error('URL da planilha e nome da aba são obrigatórios');
            }

            // Buscar token de acesso
            const { data: connection, error: fetchError } = await supabase
                .from('google_sheets_connections')
                .select('access_token')
                .eq('user_id', userId)
                .single();

            if (fetchError || !connection) {
                throw new Error('Nenhuma conexão Google encontrada. Conecte primeiro.');
            }

            // Iniciar sincronização em tempo real
            const stopSync = startRealtimeSync(userId, {
                spreadsheetId,
                sheetName,
                range,
                accessToken: connection.access_token
            }, syncInterval);

            // Salvar configuração
            await supabase.from('google_sheets_connections').update({
                spreadsheet_id: spreadsheetId,
                sheet_names: [sheetName],
                sync_interval_seconds: syncInterval,
                last_sync: new Date().toISOString()
            }).eq('user_id', userId);

            setMessage({
                type: 'success',
                text: `✅ Sincronização iniciada! Dados atualizados a cada ${syncInterval} segundos.`
            });

            onConnected?.();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Erro ao iniciar sincronização'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                <h3 className="text-xl font-semibold text-slate-100">Google Sheets Sync</h3>
            </div>

            {/* Passo 1: Conectar Google */}
            <div className="mb-6 pb-6 border-b border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                    1. Conectar Conta Google
                </label>
                <button
                    onClick={handleConnectGoogle}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                    <Link2 className="w-4 h-4" />
                    {loading ? 'Conectando...' : 'Conectar com Google'}
                </button>
            </div>

            {/* Passo 2: Selecionar Planilha */}
            <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
                <label className="block text-sm font-medium text-slate-300">
                    2. URL da Planilha Google
                </label>
                <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/..."
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500"
                />

                <label className="block text-sm font-medium text-slate-300 mt-4">
                    Nome da Aba (ex: Sheet1)
                </label>
                <input
                    type="text"
                    placeholder="Sheet1"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500"
                />

                <label className="block text-sm font-medium text-slate-300 mt-4">
                    Intervalo (Range)
                </label>
                <input
                    type="text"
                    placeholder="A1:Z1000"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500"
                />
            </div>

            {/* Passo 3: Intervalo de Sincronização */}
            <div className="mb-6 pb-6 border-b border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                    3. Intervalo de Sincronização (segundos)
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="60"
                        max="3600"
                        step="60"
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(Number(e.target.value))}
                        className="flex-1"
                    />
                    <span className="text-emerald-400 font-semibold min-w-[80px]">
                        {syncInterval < 60 ? syncInterval + 's' : (syncInterval / 60).toFixed(1) + 'min'}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    ⚡ Recomendado: 60-300s (1-5 min) para melhor performance
                </p>
            </div>

            {/* Iniciar Sincronização */}
            <button
                onClick={handleStartSync}
                disabled={loading || !spreadsheetUrl || !sheetName}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Iniciando...' : 'Iniciar Sincronização em Tempo Real'}
            </button>

            {/* Mensagem de Status */}
            {message && (
                <div
                    className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={message.type === 'success' ? 'text-emerald-100' : 'text-red-100'}>
                        {message.text}
                    </p>
                </div>
            )}
        </div>
    );
}
