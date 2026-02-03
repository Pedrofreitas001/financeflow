import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export const uploadExcelFile = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Ler arquivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Salvar dados no Supabase
    const { data, error } = await supabase
        .from('user_data')
        .insert({
            user_id: user.id,
            file_name: file.name,
            file_type: 'excel',
            data: jsonData
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
