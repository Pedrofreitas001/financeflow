// components/DataUploadButtons.tsx
// Componentes de botão para Inserir Dados e Salvar no Excel

import React from 'react';
import { useExcelExport } from '@/utils/excelUtils';

interface DataUploadButtonsProps {
    onInsertData: () => void;
    onSaveExcel: (data: any[]) => void;
    data?: any[];
    disabled?: boolean;
}

export function InsertDataButton({ onInsertData, disabled = false }: Partial<DataUploadButtonsProps>) {
    return (
        <button
            onClick={onInsertData}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
            Inserir Dados
        </button>
    );
}

export function SaveExcelButton({ onSaveExcel, data, disabled = false }: Partial<DataUploadButtonsProps>) {
    const handleClick = () => {
        if (!data || data.length === 0) {
            alert('Nenhum dado para salvar');
            return;
        }
        onSaveExcel?.(data);
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || !data || data.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
            Salvar no Excel
        </button>
    );
}

export function DataUploadButtonsGroup({
    onInsertData,
    onSaveExcel,
    data,
    disabled = false,
}: DataUploadButtonsProps) {
    return (
        <div className="flex gap-3">
            <InsertDataButton onInsertData={onInsertData} disabled={disabled} />
            <SaveExcelButton onSaveExcel={onSaveExcel} data={data} disabled={disabled} />
        </div>
    );
}
