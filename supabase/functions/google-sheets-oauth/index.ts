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
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const GOOGLE_REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("[google-sheets-oauth] request", { method: req.method });
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error("Supabase env missing");
        }
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
            throw new Error("Google OAuth env missing");
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            console.warn("[google-sheets-oauth] missing Authorization header");
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

        let body: any;
        try {
            body = await req.json();
        } catch {
            console.error("[google-sheets-oauth] invalid JSON body");
            return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { code, state, redirect_uri } = body || {};
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
            let errorText = "";
            try {
                const json = await tokenResponse.json();
                errorText = JSON.stringify(json);
            } catch {
                errorText = await tokenResponse.text();
            }
            console.error("[google-sheets-oauth] token exchange failed", errorText);
            throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokens = await tokenResponse.json();

        const spreadsheetId = statePayload.spreadsheetId || "";
        const sheetName = statePayload.sheetName || "";
        const dashboardType = statePayload.dashboardType || "dashboard";
        const range = statePayload.range || "A1:Z1000";
        const syncIntervalSeconds = statePayload.syncIntervalSeconds || 28800;

        // Fetch spreadsheet name from Google API
        let spreadsheetName = spreadsheetId;
        if (spreadsheetId && tokens.access_token) {
            try {
                const metaRes = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=properties.title`,
                    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
                );
                if (metaRes.ok) {
                    const meta = await metaRes.json();
                    spreadsheetName = meta?.properties?.title || spreadsheetId;
                }
            } catch {
                // fallback to spreadsheetId
            }
        }

        // Use service role client to bypass RLS for upsert
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        const userId = userData.user.id;

        // Check if a connection already exists for this user + dashboard_type
        const { data: existing } = await supabaseAdmin
            .from("google_sheets_connections")
            .select("id")
            .eq("user_id", userId)
            .eq("dashboard_type", dashboardType)
            .maybeSingle();

        const connectionData = {
            user_id: userId,
            dashboard_type: dashboardType,
            spreadsheet_id: spreadsheetId,
            spreadsheet_name: spreadsheetName,
            sheet_name: sheetName,
            sheet_names: sheetName ? [sheetName] : [],
            range,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || "",
            sync_interval_seconds: syncIntervalSeconds,
            is_active: true,
        };

        if (existing?.id) {
            // Update existing connection for this dashboard type
            const { error: updateError } = await supabaseAdmin
                .from("google_sheets_connections")
                .update(connectionData)
                .eq("id", existing.id);
            if (updateError) throw updateError;
        } else {
            // Insert new connection
            const { error: insertError } = await supabaseAdmin
                .from("google_sheets_connections")
                .insert(connectionData);
            if (insertError) throw insertError;
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
        let errorMessage = "";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            try {
                errorMessage = JSON.stringify(error);
            } catch {
                errorMessage = String(error);
            }
        }
        console.error("[google-sheets-oauth] error", errorMessage);
        return new Response(JSON.stringify({ success: false, error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
