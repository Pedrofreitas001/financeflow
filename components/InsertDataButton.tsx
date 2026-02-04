// components/InsertDataButton.tsx
// Botão reutilizável para inserir dados em qualquer dashboard

import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface InsertDataButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export default function InsertDataButton({ onClick, disabled = false }: InsertDataButtonProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white'
                }`}
        >
            Inserir Dados
        </button>
    );
}
