// landing/pages/GoogleSheetsAuth.tsx
// Página de callback do OAuth2 do Google

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
                const state = searchParams.get('state');

                if (!code) {
                    throw new Error('Código de autorização não encontrado');
                }

                // 1. Trocar código por access token
                const tokens = await exchangeCodeForToken(code);

                // 2. Buscar informações do usuário Google
                const userResponse = await fetch(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`
                        }
                    }
                );

                const googleUser = await userResponse.json();

                // 3. Buscar usuário autenticado do Supabase
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    throw new Error('Usuário não autenticado');
                }

                // 4. Armazenar tokens no Supabase de forma segura
                const { error: insertError } = await supabase
                    .from('google_sheets_connections')
                    .insert({
                        user_id: user.id,
                        spreadsheet_id: state || '', // Você passará ao iniciar o login
                        spreadsheet_name: 'A definir',
                        sheet_names: [],
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token || '',
                        google_user_email: googleUser.email
                    });

                if (insertError) throw insertError;

                // 5. Redirecionar para seleção de planilha
                navigate('/preparar-dados?google-connected=true');
            } catch (err) {
                console.error('Erro na autenticação Google:', err);
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
                setTimeout(() => navigate('/preparar-dados?error=google-auth'), 3000);
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
