// components/GoogleSheetConnector.tsx
// Interface para conectar Google Sheets

import { useState } from 'react';
import { getGoogleAuthUrl } from '@/utils/googleSheetsAuth';
import { Sparkles, Link2, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleSheetConnectorProps {
    userId: string;
    initialDashboardType?: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';
    onConnected?: () => void;
    variant?: 'light' | 'dark';
}

export default function GoogleSheetConnector({
    userId,
    initialDashboardType = 'dashboard',
    onConnected,
    variant = 'dark',
}: GoogleSheetConnectorProps) {
    const [loading, setLoading] = useState(false);
    const [dashboardType, setDashboardType] = useState(initialDashboardType);
    const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
    const [sheetName, setSheetName] = useState('');
    const [range, setRange] = useState('A1:Z1000');
    const [syncInterval, setSyncInterval] = useState(120);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isLight = variant === 'light';

    const extractSpreadsheetId = (url: string): string => {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : '';
    };

    const handleConnectGoogle = async () => {
        try {
            setLoading(true);
            const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
            if (!spreadsheetId || !sheetName) {
                throw new Error('URL da planilha e nome da aba sao obrigatorios');
            }

            const statePayload = {
                userId,
                dashboardType,
                spreadsheetId,
                sheetName,
                range,
                syncIntervalSeconds: syncInterval,
            };

            const encodedState = btoa(JSON.stringify(statePayload));
            const authUrl = await getGoogleAuthUrl(encodedState);
            window.location.href = authUrl;
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Erro ao conectar Google',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStartSync = async () => {
        setMessage({
            type: 'success',
            text: 'Conexao criada. A sincronizacao automatica sera feita no backend 3x ao dia.',
        });
        onConnected?.();
    };

    return (
        <div
            className={`${isLight ? 'bg-white border border-gray-200' : 'bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-emerald-500/20'
                } rounded-xl p-8 shadow-sm`}
        >
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`} />
                <h3 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-slate-100'}`}>Google Sheets Sync</h3>
            </div>

            <div className="mb-6 pb-6 border-b border-slate-700/30">
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-3`}>
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

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-700/30">
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>
                    2. Dashboard de Destino
                </label>
                <select
                    value={dashboardType}
                    onChange={(e) => setDashboardType(e.target.value as any)}
                    className={`w-full rounded-lg px-4 py-2 ${isLight
                        ? 'bg-white border border-gray-300 text-gray-900'
                        : 'bg-slate-800/50 border border-slate-600 text-slate-100'
                        }`}
                >
                    <option value="dashboard">Dashboard</option>
                    <option value="despesas">Despesas</option>
                    <option value="dre">DRE</option>
                    <option value="cashflow">Cash Flow</option>
                    <option value="indicadores">Indicadores</option>
                    <option value="orcamento">Orcamento</option>
                    <option value="balancete">Balancete</option>
                </select>

                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>
                    3. URL da Planilha Google
                </label>
                <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/..."
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    className={`w-full rounded-lg px-4 py-2 ${isLight
                        ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        : 'bg-slate-800/50 border border-slate-600 text-slate-100 placeholder-slate-500'
                        }`}
                />

                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mt-4`}>
                    Nome da Aba (ex: Sheet1)
                </label>
                <input
                    type="text"
                    placeholder="Sheet1"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className={`w-full rounded-lg px-4 py-2 ${isLight
                        ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        : 'bg-slate-800/50 border border-slate-600 text-slate-100 placeholder-slate-500'
                        }`}
                />

                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mt-4`}>
                    Intervalo (Range)
                </label>
                <input
                    type="text"
                    placeholder="A1:Z1000"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className={`w-full rounded-lg px-4 py-2 ${isLight
                        ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        : 'bg-slate-800/50 border border-slate-600 text-slate-100 placeholder-slate-500'
                        }`}
                />
            </div>

            <div className="mb-6 pb-6 border-b border-slate-700/30">
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-3`}>
                    3. Intervalo de Sincronizacao (segundos)
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
                    <span className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'} font-semibold min-w-[80px]`}>
                        {syncInterval < 60 ? `${syncInterval}s` : `${(syncInterval / 60).toFixed(1)}min`}
                    </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'} mt-2`}>
                    Recomendado: 60-300s (1-5 min) para melhor performance
                </p>
            </div>

            <button
                onClick={handleStartSync}
                disabled={loading || !spreadsheetUrl || !sheetName}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Iniciando...' : 'Iniciar Sincronizacao'}
            </button>

            {message && (
                <div
                    className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                        ? isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30'
                        : isLight ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/30'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-500'} flex-shrink-0 mt-0.5`} />
                    ) : (
                        <AlertCircle className={`w-5 h-5 ${isLight ? 'text-red-600' : 'text-red-500'} flex-shrink-0 mt-0.5`} />
                    )}
                    <p className={message.type === 'success' ? (isLight ? 'text-emerald-700' : 'text-emerald-100') : (isLight ? 'text-red-700' : 'text-red-100')}>
                        {message.text}
                    </p>
                </div>
            )}
        </div>
    );
}
