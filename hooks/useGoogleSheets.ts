// hooks/useGoogleSheets.ts
// Hook para integrar com Google Sheets API (OAuth Code Flow moderno)

import { useEffect, useState, useCallback } from 'react';
import { exchangeCodeForToken } from '@/utils/googleSheetsAuth';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export interface GoogleSheetsConfig {
    clientId: string;
    apiKey: string;
}

export function useGoogleSheets() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gisLoaded, setGisLoaded] = useState(false);

    const config: GoogleSheetsConfig = {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    };

    useEffect(() => {
        if (!config.clientId) {
            setError('Google Client ID não configurado');
            return;
        }

        if (!config.apiKey) {
            setError('Google API Key não configurada');
            return;
        }

        let isMounted = true;

        const initClient = async () => {
            try {
                if (!window.gapi?.client) {
                    console.log('Google API client não disponível, usando fallback fetch');
                    if (isMounted) {
                        setIsLoaded(true);
                        setError(null);
                    }
                    return;
                }

                try {
                    await window.gapi.client.init({
                        apiKey: config.apiKey,
                        discoveryDocs: [
                            'https://sheets.googleapis.com/$discovery/rest?version=v4',
                            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                        ],
                    });
                    console.log('Google API client inicializado com API Key');
                } catch (initErr: any) {
                    console.warn('gapi.client.init() falhou:', initErr.message);
                }

                if (isMounted) {
                    setIsLoaded(true);
                    setError(null);
                }
            } catch (err: any) {
                console.error('Erro ao inicializar Google API:', err);
                if (isMounted) {
                    setIsLoaded(true);
                    setError(null);
                }
            }
        };

        const loadGoogleAPI = async () => {
            try {
                if (window.gapi && window.gapi.client) {
                    if (isMounted) {
                        await initClient();
                    }
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.async = true;
                script.defer = true;

                script.onload = () => {
                    if (isMounted && window.gapi) {
                        window.gapi.load('client', async () => {
                            if (isMounted) {
                                await initClient();
                            }
                        });
                    }
                };

                script.onerror = () => {
                    if (isMounted) {
                        console.warn('Google API library não carregada, usando acesso direto');
                        setIsLoaded(true);
                    }
                };

                document.body.appendChild(script);
            } catch (err: any) {
                if (isMounted) {
                    console.warn(`Erro ao carregar Google API: ${err.message}`);
                    setIsLoaded(true);
                }
            }
        };

        const loadGoogleIdentity = () => {
            if (window.google?.accounts?.oauth2) {
                setGisLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (isMounted) {
                    setGisLoaded(true);
                }
            };
            script.onerror = () => {
                if (isMounted) {
                    console.warn('Google Identity Services não carregado');
                }
            };
            document.body.appendChild(script);
        };

        loadGoogleAPI();
        loadGoogleIdentity();

        return () => {
            isMounted = false;
        };
    }, [config.apiKey, config.clientId]);

    const signIn = useCallback(async () => {
        try {
            console.log('=== INICIANDO PROCESSO DE LOGIN (GIS Code Flow) ===');
            console.log('Client ID:', config.clientId);
            console.log('Origem atual:', window.location.origin);

            if (!gisLoaded || !window.google?.accounts?.oauth2) {
                console.error('❌ Google Identity Services não disponível');
                return false;
            }

            console.log('🔐 Abrindo popup de login (code flow)...');

            return await new Promise<boolean>((resolve) => {
                const codeClient = window.google.accounts.oauth2.initCodeClient({
                    client_id: config.clientId,
                    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
                    ux_mode: 'popup',
                    callback: async (response: any) => {
                        try {
                            if (!response?.code) {
                                throw new Error('Código de autorização não recebido');
                            }

                            const tokens = await exchangeCodeForToken(response.code, 'postmessage');
                            const accessToken = tokens?.access_token;

                            if (!accessToken) {
                                throw new Error('Access token não recebido');
                            }

                            if (window.gapi?.client?.setToken) {
                                window.gapi.client.setToken({ access_token: accessToken });
                            }

                            setIsSignedIn(true);
                            resolve(true);
                        } catch (err: any) {
                            console.error('❌ ERRO NO GOOGLE AUTH:', err);
                            resolve(false);
                        }
                    }
                });

                codeClient.requestCode();
            });
        } catch (err: any) {
            console.error('❌ ERRO NO GOOGLE AUTH:', err);
            return false;
        }
    }, [config.clientId, gisLoaded]);

    const signOut = useCallback(async () => {
        setIsSignedIn(false);
    }, []);

    const getSpreadsheetMetadata = useCallback(async (spreadsheetId: string) => {
        try {
            if (!isLoaded) {
                throw new Error('Google API não está pronta');
            }

            if (window.gapi?.client?.sheets?.spreadsheets?.get) {
                const response = await window.gapi.client.sheets.spreadsheets.get({
                    spreadsheetId,
                });

                return {
                    title: response.result?.properties?.title || 'Sem título',
                    sheets: (response.result?.sheets || []).map((sheet: any) => ({
                        title: sheet.properties?.title,
                        sheetId: sheet.properties?.sheetId,
                        rowCount: sheet.properties?.gridProperties?.rowCount,
                        columnCount: sheet.properties?.gridProperties?.columnCount,
                    })),
                };
            }

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?key=${config.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro ao buscar metadata: ${response.status}`);
            }

            const data = await response.json();

            return {
                title: data.properties?.title || 'Sem título',
                sheets: (data.sheets || []).map((sheet: any) => ({
                    title: sheet.properties?.title,
                    sheetId: sheet.properties?.sheetId,
                    rowCount: sheet.properties?.gridProperties?.rowCount,
                    columnCount: sheet.properties?.gridProperties?.columnCount,
                })),
            };
        } catch (err: any) {
            console.error('Erro ao buscar metadados:', err);
            throw new Error(err?.message || 'Erro ao buscar informações da planilha');
        }
    }, [isLoaded, config.apiKey]);

    const readSpreadsheet = useCallback(async (
        spreadsheetId: string,
        range: string = 'Sheet1'
    ): Promise<{
        values: any[][];
        columns: string[];
        rowCount: number;
    }> => {
        const buildRangeWithSheet = (sheetTitle: string) => `${sheetTitle}!A1:Z1000`;
        const resolveRange = (inputRange: string) => {
            if (inputRange.includes('!')) return inputRange;
            if (inputRange.includes(':')) return inputRange;
            return buildRangeWithSheet(inputRange);
        };

        const tryFetch = async (rangeToUse: string) => {
            if (window.gapi?.client?.sheets?.spreadsheets?.values?.get) {
                const response = await window.gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: rangeToUse,
                });

                const values = response.result?.values || [];

                if (values.length === 0) {
                    throw new Error('Planilha vazia ou não encontrada');
                }

                const columns = values[0] || [];
                const data = values.slice(1);

                return {
                    values: data,
                    columns,
                    rowCount: data.length,
                };
            }

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(rangeToUse)}?key=${config.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Planilha não encontrada. Verifique o ID.');
                } else if (response.status === 403) {
                    throw new Error('Sem permissão para acessar a planilha. Verifique se ela é pública.');
                }
                throw new Error(`Erro HTTP ${response.status}`);
            }

            const data = await response.json();
            const values = data.values || [];

            if (values.length === 0) {
                throw new Error('Planilha vazia');
            }

            const columns = values[0] || [];
            const rows = values.slice(1);

            return {
                values: rows,
                columns,
                rowCount: rows.length,
            };
        };

        try {
            if (!isLoaded) {
                throw new Error('Google API não está pronta');
            }

            const primaryRange = resolveRange(range);
            return await tryFetch(primaryRange);
        } catch (err: any) {
            const message = err?.message || String(err);
            if (message.includes('Unable to parse range') || message.includes('não encontrada')) {
                try {
                    const metadata = await getSpreadsheetMetadata(spreadsheetId);
                    const firstSheet = metadata?.sheets?.[0]?.title;
                    if (firstSheet) {
                        return await tryFetch(buildRangeWithSheet(firstSheet));
                    }
                } catch (fallbackErr) {
                    console.error('Fallback de metadata falhou:', fallbackErr);
                }
            }

            console.error('Erro ao ler planilha:', err);
            throw new Error(err?.message || 'Erro ao ler a planilha do Google Sheets');
        }
    }, [isLoaded, config.apiKey, getSpreadsheetMetadata]);

    const listUserSpreadsheets = useCallback(async () => {
        try {
            console.log('listUserSpreadsheets iniciando...', { isSignedIn, hasGapi: !!window.gapi });

            if (window.gapi?.client?.drive?.files?.list) {
                try {
                    console.log('Tentando listar via Google Drive API...');
                    const response = await window.gapi.client.drive.files.list({
                        pageSize: 50,
                        spaces: 'drive',
                        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
                        fields: 'files(id, name, modifiedTime, webViewLink)',
                        orderBy: 'modifiedTime desc',
                    });

                    const files = response.result?.files || [];
                    console.log(`Drive API retornou ${files.length} planilhas`);

                    if (files.length > 0) {
                        return files;
                    }
                } catch (driveErr: any) {
                    console.error('Drive API falhou:', driveErr);
                    throw new Error(`Erro ao acessar Google Drive: ${driveErr.message || 'Verifique se está autenticado'}`);
                }
            }

            if (!isSignedIn) {
                throw new Error('Por favor, autentique-se com sua conta Google para listar suas planilhas');
            }

            throw new Error('Google Drive API não disponível. Verifique sua conexão e tente novamente.');
        } catch (err: any) {
            console.error('Erro ao listar planilhas:', err);
            throw err;
        }
    }, [isSignedIn]);

    return {
        isLoaded,
        isSignedIn,
        error,
        signIn,
        signOut,
        readSpreadsheet,
        getSpreadsheetMetadata,
        listUserSpreadsheets,
    };
}
