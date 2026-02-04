// components/GoogleSheetsIntegration.tsx
// Componente de exemplo para integração com Google Sheets

import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { saveDataToHistory } from '@/utils/dataHistoryManager';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../context/ThemeContext';

interface GoogleSheetsIntegrationProps {
    dashboardType: 'dashboard' | 'despesas' | 'dre' | 'cashflow' | 'indicadores' | 'orcamento' | 'balancete';
    onDataLoaded?: (data: any[]) => void;
}

export default function GoogleSheetsIntegration({ dashboardType, onDataLoaded }: GoogleSheetsIntegrationProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { isLoaded, isSignedIn, signIn, readSpreadsheet, error } = useGoogleSheets();
    const [loading, setLoading] = useState(false);
    const [spreadsheetId, setSpreadsheetId] = useState('');

    const handleConnect = async () => {
        if (!spreadsheetId.trim()) {
            alert('Por favor, insira o ID da planilha');
            return;
        }

        setLoading(true);
        try {
            // Se não estiver autenticado, fazer login primeiro
            if (!isSignedIn) {
                const success = await signIn();
                if (!success) {
                    alert('Erro ao autenticar com Google');
                    return;
                }
            }

            // Ler dados da planilha
            const result = await readSpreadsheet(spreadsheetId, 'Sheet1');

            // Converter para array de objetos
            const data = result.values.map((row: any[]) => {
                const obj: any = {};
                result.columns.forEach((col: string, index: number) => {
                    obj[col] = row[index] || '';
                });
                return obj;
            });

            // Salvar no histórico
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await saveDataToHistory(
                    user.id,
                    dashboardType,
                    'google_sheets',
                    `Google Sheets: ${spreadsheetId}`,
                    result.rowCount,
                    result.columns
                );
            }

            // Callback com dados
            if (onDataLoaded) {
                onDataLoaded(data);
            }

            alert(`✅ ${result.rowCount} linhas carregadas com sucesso!`);
        } catch (err: any) {
            console.error('Erro ao carregar Google Sheets:', err);
            alert(`Erro: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const extractIdFromUrl = (url: string) => {
        // Extrair ID da URL do Google Sheets
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : url;
    };

    const handlePaste = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const id = extractIdFromUrl(value);
        setSpreadsheetId(id);
    };

    if (!isLoaded) {
        return (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-surface-dark' : 'bg-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Carregando Google Sheets API...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-400">Erro: {error}</p>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white border border-gray-200'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Conectar Google Sheets
            </h3>

            <div className="space-y-3">
                {!isSignedIn && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            Você precisa fazer login com sua conta Google
                        </p>
                    </div>
                )}

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ID ou URL da Planilha
                    </label>
                    <input
                        type="text"
                        value={spreadsheetId}
                        onChange={handlePaste}
                        placeholder="Cole a URL ou ID da planilha"
                        className={`w-full px-3 py-2 rounded-lg border ${isDark
                                ? 'bg-background-dark border-border-dark text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        Exemplo: https://docs.google.com/spreadsheets/d/1ABC.../edit
                    </p>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={loading || !spreadsheetId.trim()}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${loading || !spreadsheetId.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                >
                    {loading ? 'Conectando...' : 'Conectar Planilha'}
                </button>
            </div>
        </div>
    );
}
