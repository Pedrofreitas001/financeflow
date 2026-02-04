// components/GoogleSheetsSelector.tsx
// Componente para selecionar Google Sheets do usuário

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { saveDataToHistory } from '@/utils/dataHistoryManager';
import { supabase } from '@/lib/supabase';
import { type DashboardType } from '@/utils/dataHistoryManager';

interface GoogleSheetsSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    dashboardType: DashboardType;
    onDataLoaded: (data: any[]) => void;
}

export function GoogleSheetsSelector({
    isOpen,
    onClose,
    dashboardType,
    onDataLoaded,
}: GoogleSheetsSelectorProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { isLoaded, isSignedIn, signIn, readSpreadsheet, listUserSpreadsheets, error: hookError } = useGoogleSheets();

    const [spreadsheets, setSpreadsheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSheetId, setSelectedSheetId] = useState('');
    const [loadingSheets, setLoadingSheets] = useState(false);
    const [status, setStatus] = useState<'init' | 'auth' | 'loading' | 'ready' | 'error' | 'manual'>('init');
    const [manualSheetId, setManualSheetId] = useState('');

    // Callback definido ANTES do useEffect que a usa
    const loadSpreadsheetsCallback = useCallback(async () => {
        try {
            setStatus('loading');
            setLoadingSheets(true);
            setError('');

            const sheets = await listUserSpreadsheets();
            setSpreadsheets(sheets);

            if (sheets.length > 0) {
                setStatus('ready');
            } else {
                setStatus('error');
                setError('Nenhuma planilha encontrada na sua conta Google');
            }
        } catch (err: any) {
            console.error('Erro ao carregar planilhas:', err);
            setStatus('error');
            setError(err?.message || 'Erro ao carregar suas planilhas');
        } finally {
            setLoadingSheets(false);
        }
    }, [listUserSpreadsheets]);

    const handleSelectSheet = useCallback(async (sheetId: string) => {
        if (!sheetId) {
            setError('Selecione uma planilha');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Ler dados
            const result = await readSpreadsheet(sheetId, 'Sheet1');

            // Converter para objetos
            const data = result.values.map((row: any[]) => {
                const obj: any = {};
                result.columns.forEach((col: string, index: number) => {
                    obj[col] = row[index] || '';
                });
                return obj;
            });

            // Salvar no histórico
            const { data: { user } } = await supabase.auth.getUser();
            const selectedSheet = spreadsheets.find(s => s.id === sheetId);
            if (user) {
                await saveDataToHistory(
                    user.id,
                    dashboardType,
                    'google_sheets',
                    `Google Sheets: ${selectedSheet?.name || sheetId}`,
                    result.rowCount,
                    result.columns
                );
            }

            onDataLoaded(data);
            onClose();
        } catch (err: any) {
            console.error('Erro:', err);
            setError(err?.message || 'Erro ao carregar dados da planilha');
        } finally {
            setLoading(false);
        }
    }, [readSpreadsheet, spreadsheets, dashboardType, onDataLoaded, onClose]);

    const extractSheetId = useCallback((url: string) => {
        // Extrair ID da URL do Google Sheets
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : url;
    }, []);

    const handleManualSubmit = useCallback(async () => {
        try {
            const id = extractSheetId(manualSheetId);
            if (!id || id.length < 20) {
                setError('ID ou URL inválida. Cole a URL completa do Google Sheets.');
                return;
            }
            await handleSelectSheet(id);
        } catch (err: any) {
            setError(err?.message || 'Erro ao processar a planilha');
        }
    }, [manualSheetId, extractSheetId, handleSelectSheet]);

    // Auto-initialize flow
    useEffect(() => {
        if (!isOpen) return;

        const initialize = async () => {
            try {
                // Esperar API carregar
                if (!isLoaded) {
                    setStatus('init');
                    return;
                }

                // Se já autenticado, carrega planilhas direto
                if (isSignedIn) {
                    console.log('Usuário já autenticado, carregando planilhas...');
                    await loadSpreadsheetsCallback();
                    return;
                }

                setStatus('auth');
                console.log('Iniciando autenticação Google...');

                // Tenta autenticar
                const success = await signIn();

                if (success) {
                    console.log('Autenticação bem-sucedida, aguardando state update...');
                    // Aguardar um pouco mais para o isSignedIn ser atualizado
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Forçar carregamento mesmo se isSignedIn não foi atualizado ainda
                    await loadSpreadsheetsCallback();
                } else {
                    console.warn('Autenticação falhou');
                    setStatus('error');
                    setError('Não foi possível autenticar. Use o botão "Inserir Link Manual" para importar uma planilha pública.');
                }
            } catch (err: any) {
                console.error('Erro na inicialização:', err);
                setStatus('error');
                setError(err?.message || 'Erro ao inicializar. Tente novamente ou use "Inserir Link Manual".');
            }
        };

        initialize();
    }, [isOpen, isLoaded, isSignedIn, loadSpreadsheetsCallback, signIn]);

    // Early return APÓS todos os hooks
    if (!isOpen) return null;

    // Estado de carregamento inicial
    if (status === 'init' || status === 'auth') {
        return (
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>
                    <div className="p-6 text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {status === 'init' ? 'Carregando Google Sheets...' : 'Autenticando com sua conta Google...'}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            Isso pode levar alguns segundos
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Estado de erro crítico
    if (status === 'error') {
        const isConfigError = error?.includes('configuração') || error?.includes('OAuth') || error?.includes('origem');

        return (
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-center">
                        <h2 className="text-lg font-bold text-white">
                            {isConfigError ? '⚙️ Erro de Configuração' : '❌ Erro'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className={`p-3 rounded-lg ${isConfigError ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                            <p className={`text-xs ${isConfigError ? 'text-yellow-400' : 'text-red-400'} font-semibold mb-2`}>
                                {error || 'Algo deu errado'}
                            </p>
                            {isConfigError && (
                                <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-1 mt-2 text-left`}>
                                    <p className="font-semibold">📋 Solução:</p>
                                    <ol className="list-decimal list-inside space-y-1 pl-2">
                                        <li>Acesse <span className="font-mono text-blue-400">console.cloud.google.com</span></li>
                                        <li>Vá em <strong>APIs & Services → Credentials</strong></li>
                                        <li>Adicione <span className="font-mono text-blue-400">{window.location.origin}</span> nas origens autorizadas</li>
                                        <li>Aguarde 5 minutos e tente novamente</li>
                                    </ol>
                                    <p className="mt-2 text-blue-400">📖 Ver: GOOGLE_OAUTH_SETUP.md</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    setError('');
                                    setStatus('manual');
                                    setManualSheetId('');
                                }}
                                className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                            >
                                🔗 Inserir Link Manual
                            </button>
                            {!isConfigError && (
                                <button
                                    onClick={() => {
                                        setError('');
                                        setStatus('auth');
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                                >
                                    🔄 Tentar Novamente
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className={`w-full px-4 py-2 rounded-lg border font-semibold transition-colors ${isDark
                                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Estado carregando planilhas
    if (status === 'loading') {
        return (
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>
                    <div className="p-6 text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Carregando suas planilhas...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Estado manual - inserir link
    if (status === 'manual') {
        return (
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-center">
                        <h2 className="text-lg font-bold text-white">Inserir Link da Planilha</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <p className="text-xs text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                URL da Planilha Google Sheets
                            </label>
                            <textarea
                                value={manualSheetId}
                                onChange={(e) => setManualSheetId(e.target.value)}
                                placeholder="Cole aqui: https://docs.google.com/spreadsheets/d/1abc...xyz/edit"
                                rows={4}
                                className={`w-full p-2 rounded-lg border text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-gray-200 placeholder-gray-500'
                                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleManualSubmit}
                                disabled={loading || !manualSheetId.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors text-white ${loading || !manualSheetId.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {loading ? 'Carregando...' : 'Importar'}
                            </button>
                            <button
                                onClick={() => setStatus('error')}
                                disabled={loading}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold border transition-colors ${isDark
                                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Estado pronto - Lista de planilhas
    if (status === 'ready') {
        return (
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[80vh] flex flex-col
                    ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-center flex-shrink-0">
                        <h2 className="text-lg font-bold text-white mb-1">Suas Planilhas</h2>
                        <p className="text-xs text-green-100">Selecione uma para importar dados</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                                <p className="text-xs text-red-400">{error}</p>
                            </div>
                        )}

                        {spreadsheets.length === 0 ? (
                            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p className="text-sm">Nenhuma planilha encontrada</p>
                                <p className="text-xs mt-2">Crie uma nova planilha no Google Sheets para começar</p>
                            </div>
                        ) : (
                            spreadsheets.map((sheet) => (
                                <button
                                    key={sheet.id}
                                    onClick={() => setSelectedSheetId(sheet.id)}
                                    disabled={loading}
                                    className={`w-full p-3 rounded-lg text-left transition-all border ${selectedSheetId === sheet.id
                                        ? isDark
                                            ? 'bg-green-600/20 border-green-500/50 text-green-300'
                                            : 'bg-green-100 border-green-400 text-green-900'
                                        : isDark
                                            ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-200'
                                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg mt-0.5">📊</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{sheet.name}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                                                Modificado: {new Date(sheet.modifiedTime).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-4 border-t border-border-dark flex-shrink-0">
                        <button
                            onClick={() => handleSelectSheet(selectedSheetId)}
                            disabled={loading || !selectedSheetId}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${loading || !selectedSheetId
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                        >
                            {loading ? 'Carregando...' : 'Importar'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold border transition-colors ${isDark
                                ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return null;
}
