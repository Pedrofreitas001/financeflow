// hooks/useGoogleSheets.ts
// Hook para integrar com Google Sheets API

import { useEffect, useState, useCallback } from 'react';

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

    const config: GoogleSheetsConfig = {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    };

    useEffect(() => {
        // Validar credenciais
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

                // Inicializar apenas com API key primeiro (sem auth)
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

                // Separadamente, inicializar auth2 se clientId estiver disponível
                if (config.clientId && window.gapi.auth2) {
                    try {
                        // Verificar se já foi inicializado
                        let authInstance = window.gapi.auth2.getAuthInstance();

                        if (!authInstance) {
                            // Inicializar auth2
                            authInstance = await window.gapi.auth2.init({
                                client_id: config.clientId,
                                scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
                                cookie_policy: 'single_host_origin',
                            });
                            console.log('Google Auth2 inicializado');
                        }

                        // Listener para mudanças de autenticação
                        authInstance.isSignedIn.listen((signed: boolean) => {
                            if (isMounted) {
                                console.log('Auth status mudou:', signed);
                                setIsSignedIn(signed);
                            }
                        });

                        // Estado inicial
                        if (isMounted) {
                            setIsSignedIn(authInstance.isSignedIn.get());
                        }
                    } catch (authErr: any) {
                        console.warn('Auth2 setup falhou:', authErr.message);
                    }
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
                // Se já foi carregado, inicializa direto
                if (window.gapi && window.gapi.client) {
                    if (isMounted) {
                        await initClient();
                    }
                    return;
                }

                // Carregar script do Google API
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.async = true;
                script.defer = true;

                script.onload = () => {
                    if (isMounted && window.gapi) {
                        window.gapi.load('client:auth2', async () => {
                            if (isMounted) {
                                await initClient();
                            }
                        });
                    }
                };

                script.onerror = () => {
                    if (isMounted) {
                        console.warn('Google API library não carregada, usando acesso direto');
                        if (isMounted) {
                            setIsLoaded(true);
                        }
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

        loadGoogleAPI();

        return () => {
            isMounted = false;
        };
    }, [config.apiKey, config.clientId]);

    const signIn = useCallback(async () => {
        try {
            console.log('=== INICIANDO PROCESSO DE LOGIN ===');
            console.log('Client ID:', config.clientId);
            console.log('Origem atual:', window.location.origin);

            // Verificar se gapi está disponível
            if (!window.gapi) {
                console.error('❌ gapi não disponível');
                return false;
            }

            // Garantir que auth2 está carregado
            if (!window.gapi.auth2) {
                console.log('📦 Carregando módulo auth2...');
                await new Promise<void>((resolve, reject) => {
                    window.gapi.load('auth2', {
                        callback: () => {
                            console.log('✅ auth2 carregado');
                            resolve();
                        },
                        onerror: () => {
                            console.error('❌ Erro ao carregar auth2');
                            reject(new Error('Falha ao carregar auth2'));
                        },
                        timeout: 5000,
                        ontimeout: () => {
                            console.error('⏱️ Timeout ao carregar auth2');
                            reject(new Error('Timeout ao carregar auth2'));
                        }
                    });
                });
            }

            // Obter ou criar instância de auth
            let authInstance = window.gapi.auth2.getAuthInstance();

            if (!authInstance) {
                console.log('🔧 Criando nova instância auth2...');
                console.log('Configuração:', {
                    client_id: config.clientId,
                    scope: 'spreadsheets.readonly + drive.readonly',
                    origin: window.location.origin
                });

                authInstance = await window.gapi.auth2.init({
                    client_id: config.clientId,
                    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
                    cookie_policy: 'single_host_origin',
                });
                console.log('✅ auth2 instance criada');
            }

            // Verificar se já está autenticado
            if (authInstance.isSignedIn.get()) {
                console.log('✅ Usuário já está autenticado');
                setIsSignedIn(true);
                return true;
            }

            // Fazer signin com opções específicas
            console.log('🔐 Abrindo popup de login...');
            const googleUser = await authInstance.signIn({
                prompt: 'select_account'
            });

            console.log('✅ Login bem-sucedido!');
            setIsSignedIn(true);
            return true;

        } catch (err: any) {
            console.error('❌ ERRO NO GOOGLE AUTH:', err);
            console.error('Tipo de erro:', err.error);
            console.error('Detalhes:', err.details);

            // Detectar erro IdentityCredentialError
            const isIdentityError = err.error?.toString?.().includes('IdentityCredentialError') ||
                err.toString?.().includes('IdentityCredentialError');

            // Mensagens de erro mais específicas
            if (err.error === 'popup_closed_by_user') {
                console.log('⚠️ Popup fechado pelo usuário');
            } else if (err.error === 'access_denied') {
                console.log('⚠️ Acesso negado pelo usuário');
            } else if (err.error === 'idpiframe_initialization_failed' || isIdentityError) {
                console.error('');
                console.error('════════════════════════════════════════════════');
                console.error('❌ ERRO DE CONFIGURAÇÃO OAUTH!');
                console.error('════════════════════════════════════════════════');
                console.error('');
                console.error('📋 SOLUÇÃO RÁPIDA (5 minutos):');
                console.error('');
                console.error('1️⃣  Acesse: https://console.cloud.google.com/apis/credentials');
                console.error('');
                console.error('2️⃣  Clique no seu OAuth 2.0 Client ID');
                console.error('');
                console.error(`3️⃣  Na seção "Authorized JavaScript origins", ADICIONE:`);
                console.error(`    ➡️  ${window.location.origin}`);
                console.error('');
                console.error('4️⃣  Clique em SAVE');
                console.error('');
                console.error('5️⃣  Aguarde 5 minutos para propagar');
                console.error('');
                console.error('6️⃣  Limpe cache: Ctrl+Shift+Delete ou aba anônima');
                console.error('');
                console.error('7️⃣  Tente novamente');
                console.error('');
                console.error('💡 ALTERNATIVA: Use "Inserir Link Manual" para planilhas públicas');
                console.error('');
                console.error('📖 Instruções completas: GOOGLE_OAUTH_SETUP.md');
                console.error('════════════════════════════════════════════════');
                console.error('');
            } else {
                console.error('❌ Erro desconhecido:', JSON.stringify(err, null, 2));
            }

            return false;
        }
    }, [config.clientId]);

    const signOut = useCallback(async () => {
        try {
            const authInstance = window.gapi?.auth2?.getAuthInstance?.();
            if (authInstance) {
                await authInstance.signOut();
            }
        } catch (err: any) {
            console.error('Erro ao fazer logout:', err);
        }
    }, []);

    const readSpreadsheet = useCallback(async (
        spreadsheetId: string,
        range: string = 'Sheet1'
    ): Promise<{
        values: any[][];
        columns: string[];
        rowCount: number;
    }> => {
        try {
            if (!isLoaded) {
                throw new Error('Google API não está pronta');
            }

            // Tentar usar gapi primeiro
            if (window.gapi?.client?.sheets?.spreadsheets?.values?.get) {
                const response = await window.gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
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

            // Fallback: usar fetch com API Key
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?key=${config.apiKey}`;

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
        } catch (err: any) {
            console.error('Erro ao ler planilha:', err);
            throw new Error(err?.message || 'Erro ao ler a planilha do Google Sheets');
        }
    }, [isLoaded, config.apiKey]);

    const getSpreadsheetMetadata = useCallback(async (spreadsheetId: string) => {
        try {
            if (!isLoaded) {
                throw new Error('Google API não está pronta');
            }

            // Tentar usar gapi primeiro
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

            // Fallback: usar fetch
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

    const listUserSpreadsheets = useCallback(async () => {
        try {
            console.log('listUserSpreadsheets iniciando...', { isSignedIn, hasGapi: !!window.gapi });

            // Método 1: Usar Google Drive API (requer autenticação)
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

            // Se chegou aqui, Drive API não está disponível ou não retornou nada
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
