// utils/googleSheetsAuth.ts
// OAuth2 Flow para Google Sheets (somente URL de consentimento)

import { supabase } from '@/lib/supabase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

export async function getGoogleAuthUrl(state?: string) {
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent'
    });

    if (state) {
        params.set('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, redirectUri?: string) {
    const { data, error } = await supabase.functions.invoke('google-sheets-oauth', {
        body: {
            code,
            redirect_uri: redirectUri || REDIRECT_URI
        }
    });

    if (error) {
        throw error;
    }

    return data;
}
