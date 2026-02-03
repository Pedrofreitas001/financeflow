/**
 * Custom Hook for File Upload and Validation
 * 
 * This hook handles:
 * - Excel/CSV file parsing
 * - Data structure analysis
 * - Validation execution
 */

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { analyzeFileStructure, validateData, type ValidationResult, type UploadedData } from './dataValidation';

export interface UseFileValidationReturn {
    uploadedFile: File | null;
    uploadedData: UploadedData | null;
    validationResult: ValidationResult | null;
    isValidating: boolean;
    error: string | null;
    handleFileUpload: (file: File) => Promise<void>;
    handleValidation: (targetPages?: string[]) => void;
    reset: () => void;
}

export function useFileValidation(): UseFileValidationReturn {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Parse Excel/CSV file and analyze structure
     */
    const handleFileUpload = async (file: File): Promise<void> => {
        setError(null);
        setValidationResult(null);
        setUploadedFile(file);

        try {
            const data = await parseFile(file);

            if (!data || data.length === 0) {
                throw new Error('Arquivo vazio ou formato inválido');
            }

            const columns = analyzeFileStructure(data);

            const uploadedDataObj: UploadedData = {
                columns,
                row_count: data.length,
                file_name: file.name,
                sheets: [] // Will be populated if multiple sheets
            };

            setUploadedData(uploadedDataObj);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo';
            setError(errorMessage);
            setUploadedFile(null);
            setUploadedData(null);
        }
    };

    /**
     * Execute validation
     */
    const handleValidation = (targetPages?: string[]): void => {
        if (!uploadedData) {
            setError('Nenhum arquivo carregado para validação');
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            // Execute local validation
            const result = validateData(uploadedData, targetPages);
            setValidationResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro na validação';
            setError(errorMessage);
        } finally {
            setIsValidating(false);
        }
    };

    /**
     * Reset all state
     */
    const reset = (): void => {
        setUploadedFile(null);
        setUploadedData(null);
        setValidationResult(null);
        setError(null);
        setIsValidating(false);
    };

    return {
        uploadedFile,
        uploadedData,
        validationResult,
        isValidating,
        error,
        handleFileUpload,
        handleValidation,
        reset
    };
}

/**
 * Parse different file formats
 */
async function parseFile(file: File): Promise<any[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        return parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
        return parseExcel(file);
    } else {
        throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
    }
}

/**
 * Parse Excel files
 */
async function parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false, // Keep formatted values
                    defval: null // Use null for empty cells
                });

                resolve(jsonData);
            } catch (err) {
                reject(new Error('Erro ao processar arquivo Excel'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };

        reader.readAsBinaryString(file);
    });
}

/**
 * Parse CSV files
 */
async function parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim());

                if (lines.length === 0) {
                    resolve([]);
                    return;
                }

                // Parse header
                const headers = parseCSVLine(lines[0]);

                // Parse rows
                const data = lines.slice(1).map(line => {
                    const values = parseCSVLine(line);
                    const row: any = {};

                    headers.forEach((header, index) => {
                        row[header] = values[index] || null;
                    });

                    return row;
                });

                resolve(data);
            } catch (err) {
                reject(new Error('Erro ao processar arquivo CSV'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };

        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Export file parsing utilities for standalone use
 */
export const fileUtils = {
    parseFile,
    parseExcel,
    parseCSV,
    parseCSVLine
};
