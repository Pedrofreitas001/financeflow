// landing/pages/GoogleSheetsAuth.tsx
// Página de callback do OAuth2 do Google

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken } from '@/utils/googleSheetsAuth';

export default function GoogleSheetsAuth() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state') || undefined;

                if (!code) {
                    throw new Error('Código de autorização não encontrado');
                }

                // 1. Trocar código por access token via edge function
                // A edge function já faz o upsert na tabela google_sheets_connections
                // usando o state payload (dashboardType, spreadsheetId, sheetName, range)
                await exchangeCodeForToken(code, undefined, state);

                // 2. Redirecionar para o dashboard na aba de configurações
                navigate('/dashboard?google-connected=true');
            } catch (err) {
                console.error('Erro na autenticação Google:', err);
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
                setTimeout(() => navigate('/dashboard?error=google-auth'), 3000);
            } finally {
                setLoading(false);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-100">Conectando ao Google Sheets...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-slate-400">Redirecionando em breve...</p>
                </div>
            </div>
        );
    }

    return null;
}
