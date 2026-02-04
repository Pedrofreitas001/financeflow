// supabase/functions/google-sheets-sync/index.ts
// Sync Google Sheets data and keep last 3 versions

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Connection = {
    id: string;
    user_id: string;
    dashboard_type: string;
    spreadsheet_id: string;
    sheet_name: string | null;
    range: string | null;
    refresh_token: string | null;
};

function toObjects(values: any[][]) {
    if (!values || values.length === 0) return [];
    const headers = values[0].map((h) => String(h || "").trim());
    return values.slice(1).map((row) => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
            if (header) {
                obj[header] = row[index] ?? "";
            }
        });
        return obj;
    });
}

async function refreshAccessToken(refreshToken: string) {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Refresh token failed: ${errorText}`);
    }

    return res.json();
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Supabase env missing");
        }
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            throw new Error("Google OAuth env missing");
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        const { data: connections, error: connectionError } = await supabase
            .from("google_sheets_connections")
            .select("id, user_id, dashboard_type, spreadsheet_id, sheet_name, range, refresh_token")
            .eq("is_active", true);

        if (connectionError) {
            throw connectionError;
        }

        const results: Array<{ id: string; success: boolean; error?: string }> = [];

        for (const connection of (connections as Connection[]) || []) {
            try {
                if (!connection.refresh_token) {
                    results.push({ id: connection.id, success: false, error: "Missing refresh token" });
                    continue;
                }

                const refreshed = await refreshAccessToken(connection.refresh_token);
                const accessToken = refreshed.access_token;

                const sheetName = connection.sheet_name || "Sheet1";
                const range = connection.range || "A1:Z1000";
                const rangeWithSheet = `${sheetName}!${range}`;

                const valuesResponse = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(connection.spreadsheet_id)}/values/${encodeURIComponent(rangeWithSheet)}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );

                if (!valuesResponse.ok) {
                    const errorText = await valuesResponse.text();
                    throw new Error(`Sheets API error: ${errorText}`);
                }

                const valuesData = await valuesResponse.json();
                const values = valuesData.values || [];
                const rows = toObjects(values);

                const now = new Date().toISOString();

                if (rows.length > 0) {
                    const insertResult = await supabase
                        .from("saved_dashboards")
                        .insert({
                            user_id: connection.user_id,
                            dashboard_type: connection.dashboard_type,
                            data: rows,
                            row_count: rows.length,
                            created_at: now,
                            updated_at: now,
                        });

                    if (insertResult.error) {
                        throw insertResult.error;
                    }

                    const { data: versions } = await supabase
                        .from("saved_dashboards")
                        .select("id")
                        .eq("user_id", connection.user_id)
                        .eq("dashboard_type", connection.dashboard_type)
                        .order("created_at", { ascending: false });

                    if (versions && versions.length > 3) {
                        const idsToDelete = versions.slice(3).map((v: any) => v.id);
                        if (idsToDelete.length > 0) {
                            await supabase.from("saved_dashboards").delete().in("id", idsToDelete);
                        }
                    }
                }

                await supabase
                    .from("google_sheets_connections")
                    .update({
                        access_token: accessToken,
                        last_sync: now,
                    })
                    .eq("id", connection.id);

                results.push({ id: connection.id, success: true });
            } catch (err) {
                results.push({ id: connection.id, success: false, error: String(err) });
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
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
