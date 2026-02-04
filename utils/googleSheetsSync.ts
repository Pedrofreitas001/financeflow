// utils/googleSheetsSync.ts
// Sincronização em tempo real do Google Sheets

import { supabase } from '@/lib/supabase';

interface GoogleSheetConfig {
    spreadsheetId: string;
    sheetName: string;
    range: string; // ex: 'A1:Z1000'
    accessToken: string;
}

interface SyncResult {
    rowsAdded: number;
    rowsModified: number;
    rowsDeleted: number;
    lastSync: string;
}

export async function fetchGoogleSheetData(
    spreadsheetId: string,
    range: string,
    accessToken: string
): Promise<any[][]> {
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${import.meta.env.VITE_GOOGLE_API_KEY}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
}

export async function syncGoogleSheetData(
    userId: string,
    config: GoogleSheetConfig
): Promise<SyncResult> {
    try {
        // 1. Buscar dados do Google Sheets
        const sheetData = await fetchGoogleSheetData(
            config.spreadsheetId,
            config.range,
            config.accessToken
        );

        if (sheetData.length === 0) {
            throw new Error('Planilha vazia ou não encontrada');
        }

        // 2. Convertir para JSON (primeira linha = headers)
        const headers = sheetData[0];
        const rows = sheetData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
                obj[header.toLowerCase().trim()] = row[index] || null;
            });
            return obj;
        });

        // 3. Calcular hash para detectar mudanças
        const currentHash = calculateHash(JSON.stringify(rows));

        // 4. Buscar última versão do Supabase
        const { data: lastVersion } = await supabase
            .from('data_versions')
            .select('*')
            .eq('user_id', userId)
            .eq('data_type', 'google_sheets')
            .eq('file_name', config.sheetName)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        // 5. Se hash diferente = dados mudaram
        if (!lastVersion || lastVersion.file_hash !== currentHash) {
            const versionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

            // Calcular diferenças
            const diffs = lastVersion ? calculateDifferences(lastVersion.data, rows) : {
                rowsAdded: rows.length,
                rowsModified: 0,
                rowsDeleted: 0
            };

            // 6. Salvar nova versão
            await supabase.from('data_versions').insert({
                user_id: userId,
                empresa: config.sheetName,
                file_name: config.sheetName,
                file_hash: currentHash,
                data_type: 'google_sheets',
                file_size: JSON.stringify(rows).length,
                row_count: rows.length,
                version_number: versionNumber,
                data: rows,
                notes: `Sincronizado do Google Sheets - ${diffs.rowsAdded} adicionadas, ${diffs.rowsModified} modificadas`,
            });

            return {
                rowsAdded: diffs.rowsAdded,
                rowsModified: diffs.rowsModified,
                rowsDeleted: diffs.rowsDeleted,
                lastSync: new Date().toISOString()
            };
        }

        return {
            rowsAdded: 0,
            rowsModified: 0,
            rowsDeleted: 0,
            lastSync: new Date().toISOString()
        };
    } catch (error) {
        console.error('Erro ao sincronizar Google Sheet:', error);
        throw error;
    }
}

function calculateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function calculateDifferences(oldData: any[], newData: any[]) {
    const oldLength = oldData.length;
    const newLength = newData.length;

    let rowsAdded = 0;
    let rowsModified = 0;
    let rowsDeleted = 0;

    if (newLength > oldLength) {
        rowsAdded = newLength - oldLength;
    } else if (newLength < oldLength) {
        rowsDeleted = oldLength - newLength;
    }

    // Comparar rows comuns
    const compareCount = Math.min(oldLength, newLength);
    for (let i = 0; i < compareCount; i++) {
        if (JSON.stringify(oldData[i]) !== JSON.stringify(newData[i])) {
            rowsModified++;
        }
    }

    return { rowsAdded, rowsModified, rowsDeleted };
}

// Polling em tempo real (a cada 2 minutos ou quando usuário estiver ativo)
export function startRealtimeSync(
    userId: string,
    config: GoogleSheetConfig,
    intervalSeconds: number = 120
) {
    const syncInterval = setInterval(async () => {
        try {
            await syncGoogleSheetData(userId, config);
        } catch (error) {
            console.error('Erro no sync automático:', error);
        }
    }, intervalSeconds * 1000);

    return () => clearInterval(syncInterval);
}
