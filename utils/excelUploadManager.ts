// utils/excelUploadManager.ts
// Gerenciar uploads de Excel com auto-cleanup (3 últimos)

import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { logUsage } from './usageTracker';

export interface ExcelUpload {
    id: string;
    fileName: string;
    dashboardType: string;
    rowCount: number;
    fileSize: number;
    uploadDate: string;
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

async function convertExcelToJSON(file: File): Promise<{ data: any[]; hash: string; rowCount: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                const dataStr = JSON.stringify(jsonData);
                const hash = calculateHash(dataStr);
                const rowCount = jsonData.length;

                resolve({ data: jsonData, hash, rowCount });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
}

export async function uploadExcelFile(
    userId: string,
    file: File,
    dashboardType: string
): Promise<{ success: boolean; message: string; fileId?: string }> {
    try {
        // 1. Converter Excel para JSON
        const { data, hash, rowCount } = await convertExcelToJSON(file);

        // 2. Verificar se já existe com mesmo hash
        const { data: existingFile } = await supabase
            .from('excel_uploads')
            .select('id')
            .eq('user_id', userId)
            .eq('dashboard_type', dashboardType)
            .eq('file_hash', hash)
            .single();

        if (existingFile) {
            return {
                success: false,
                message: 'Este arquivo já foi enviado anteriormente para este dashboard'
            };
        }

        // 3. Contar uploads atuais para este dashboard
        const { data: currentUploads, count } = await supabase
            .from('excel_uploads')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('dashboard_type', dashboardType)
            .order('upload_date', { ascending: false });

        // 4. Se já tem 3, deletar o mais antigo
        if (count && count >= 3 && currentUploads) {
            const oldestId = currentUploads[currentUploads.length - 1].id;
            await supabase
                .from('excel_uploads')
                .delete()
                .eq('id', oldestId);
        }

        // 5. Inserir novo upload
        const { data: uploadData, error: insertError } = await supabase
            .from('excel_uploads')
            .insert({
                user_id: userId,
                dashboard_type: dashboardType,
                file_name: file.name,
                file_hash: hash,
                file_size: file.size,
                row_count: rowCount,
                data,
                is_manual: true,
                upload_order: (count || 0) + 1
            })
            .select('id')
            .single();

        if (insertError) throw insertError;

        // 6. Log de uso
        await logUsage(userId, 'excel_upload', {
            file_name: file.name,
            row_count: rowCount,
            file_size: file.size,
            dashboard_type: dashboardType
        });

        return {
            success: true,
            message: `Excel enviado com sucesso! (${rowCount} linhas)`,
            fileId: uploadData?.id
        };
    } catch (error) {
        console.error('Erro ao fazer upload do Excel:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Erro ao processar arquivo'
        };
    }
}

export async function getExcelHistory(
    userId: string,
    dashboardType: string
): Promise<ExcelUpload[]> {
    try {
        const { data, error } = await supabase
            .from('excel_uploads')
            .select('id, file_name, dashboard_type, row_count, file_size, upload_date')
            .eq('user_id', userId)
            .eq('dashboard_type', dashboardType)
            .eq('is_manual', true)
            .order('upload_date', { ascending: false })
            .limit(3);

        if (error) throw error;

        return data?.map(d => ({
            id: d.id,
            fileName: d.file_name,
            dashboardType: d.dashboard_type,
            rowCount: d.row_count,
            fileSize: d.file_size,
            uploadDate: d.upload_date
        })) || [];
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
    }
}

export async function reuploadExcelFromHistory(
    userId: string,
    fileId: string
): Promise<{ success: boolean; data?: any[] }> {
    try {
        const { data, error } = await supabase
            .from('excel_uploads')
            .select('data')
            .eq('id', fileId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return {
            success: true,
            data: data?.data
        };
    } catch (error) {
        console.error('Erro ao recuperar arquivo:', error);
        return { success: false };
    }
}

export async function deleteExcelUpload(userId: string, fileId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('excel_uploads')
            .delete()
            .eq('id', fileId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao deletar arquivo:', error);
        return false;
    }
}
