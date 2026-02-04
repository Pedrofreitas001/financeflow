// supabase/functions/google-sheets-oauth/index.ts
// Exchange OAuth code for tokens and store connection

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type StatePayload = {
    userId?: string;
    dashboardType?: string;
    spreadsheetId?: string;
    sheetName?: string;
    range?: string;
    syncIntervalSeconds?: number;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const GOOGLE_REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error("Supabase env missing");
        }
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
            throw new Error("Google OAuth env missing");
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false },
        });

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return new Response(JSON.stringify({ success: false, error: "User not found" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { code, state, redirect_uri } = await req.json();
        if (!code) {
            return new Response(JSON.stringify({ success: false, error: "Missing code" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let statePayload: StatePayload = {};
        if (state) {
            try {
                statePayload = JSON.parse(atob(state));
            } catch {
                statePayload = {};
            }
        }

        const tokenParams = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            redirect_uri: redirect_uri || GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: tokenParams.toString(),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokens = await tokenResponse.json();

        const spreadsheetId = statePayload.spreadsheetId || "";
        const sheetName = statePayload.sheetName || "";
        const dashboardType = statePayload.dashboardType || "dashboard";
        const range = statePayload.range || "A1:Z1000";
        const syncIntervalSeconds = statePayload.syncIntervalSeconds || 28800;

        const { error: upsertError } = await supabase
            .from("google_sheets_connections")
            .upsert({
                user_id: userData.user.id,
                dashboard_type: dashboardType,
                spreadsheet_id: spreadsheetId,
                spreadsheet_name: spreadsheetId,
                sheet_name: sheetName,
                sheet_names: sheetName ? [sheetName] : [],
                range,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || "",
                sync_interval_seconds: syncIntervalSeconds,
                is_active: true,
            }, {
                onConflict: "user_id,spreadsheet_id",
            });

        if (upsertError) {
            throw upsertError;
        }

        return new Response(JSON.stringify({
            success: true,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
            scope: tokens.scope,
            token_type: tokens.token_type,
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: String(error) }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
