import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export interface ExportOptions {
    filename?: string;
    sheetName?: string;
    dateFormat?: 'DD/MM/YYYY' | 'YYYY-MM-DD';
}

/**
 * Exporta dados para arquivo Excel
 * @param data - Array de objetos a exportar
 * @param options - Opções de exportação
 */
export function exportToExcel(
    data: any[],
    options: ExportOptions = {}
) {
    try {
        const {
            filename = 'export.xlsx',
            sheetName = 'Dados',
            dateFormat = 'DD/MM/YYYY',
        } = options;

        if (!data || data.length === 0) {
            alert('Nenhum dado para exportar');
            return;
        }

        // Criar workbook
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Auto-ajustar largura das colunas
        const colWidths = Object.keys(data[0]).map(key => ({
            wch: Math.max(
                key.length,
                Math.max(...data.map(row => String(row[key] || '').length))
            ) + 2,
        }));
        ws['!cols'] = colWidths;

        // Salvar arquivo
        const timestamp = new Date().toISOString().split('T')[0];
        const finalFilename = filename.includes('.xlsx')
            ? filename
            : `${filename}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, finalFilename);

        console.log(`✅ Arquivo exportado: ${finalFilename}`);
        return finalFilename;
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        alert('Erro ao exportar arquivo');
        throw error;
    }
}

/**
 * Exporta múltiplas abas para um único arquivo Excel
 * @param sheets - Objeto com nome da aba como chave e dados como valor
 * @param filename - Nome do arquivo
 */
export function exportToExcelMultipleSheets(
    sheets: Record<string, any[]>,
    filename: string = 'export.xlsx'
) {
    try {
        if (Object.keys(sheets).length === 0) {
            alert('Nenhuma aba para exportar');
            return;
        }

        const wb = XLSX.utils.book_new();

        Object.entries(sheets).forEach(([sheetName, data]) => {
            if (data && data.length > 0) {
                const ws = XLSX.utils.json_to_sheet(data);

                // Auto-ajustar largura
                const colWidths = Object.keys(data[0]).map(key => ({
                    wch: Math.max(
                        key.length,
                        Math.max(...data.map(row => String(row[key] || '').length))
                    ) + 2,
                }));
                ws['!cols'] = colWidths;

                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            }
        });

        const timestamp = new Date().toISOString().split('T')[0];
        const finalFilename = filename.includes('.xlsx')
            ? filename
            : `${filename}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, finalFilename);

        console.log(`✅ Arquivo com múltiplas abas exportado: ${finalFilename}`);
        return finalFilename;
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        alert('Erro ao exportar arquivo');
        throw error;
    }
}

/**
 * Importa dados de arquivo Excel
 * @param file - Arquivo a importar
 * @returns Promise com dados importados
 */
export async function importFromExcel(file: File): Promise<{
    sheets: Record<string, any[]>;
    firstSheet: any[];
    filename: string;
    rowCount: number;
    columnCount: number;
    columns: string[];
}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    reject(new Error('Nenhum dado lido do arquivo'));
                    return;
                }

                const workbook = XLSX.read(data, { type: 'array' });

                const sheets: Record<string, any[]> = {};
                let firstSheet: any[] = [];
                let columnCount = 0;
                let columns: string[] = [];

                // Processar todas as abas
                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    sheets[sheetName] = jsonData;

                    // Guardar dados da primeira aba
                    if (sheetName === workbook.SheetNames[0]) {
                        firstSheet = jsonData;
                        if (jsonData.length > 0) {
                            columns = Object.keys(jsonData[0]);
                            columnCount = columns.length;
                        }
                    }
                });

                // Validação - verificar se temos dados
                if (!firstSheet || firstSheet.length === 0) {
                    reject(new Error('Arquivo Excel vazio ou sem dados válidos'));
                    return;
                }

                resolve({
                    sheets,
                    firstSheet,
                    filename: file.name,
                    rowCount: firstSheet.length,
                    columnCount,
                    columns,
                });
            } catch (error: any) {
                console.error('Erro ao processar Excel:', error);
                reject(new Error(`Erro ao processar arquivo Excel: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Hook React para usar exportação Excel
 */
export function useExcelExport() {
    return {
        exportToExcel,
        exportToExcelMultipleSheets,
        importFromExcel,
    };
}
