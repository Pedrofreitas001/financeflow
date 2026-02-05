// components/InsertDataButton.tsx
// Botão reutilizável para inserir dados em qualquer dashboard

import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface InsertDataButtonProps {
    onClick: () => void;
    disabled?: boolean;
    compact?: boolean;
}

export default function InsertDataButton({ onClick, disabled = false, compact = false }: InsertDataButtonProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const sizeClass = compact ? 'px-3 py-1.5 text-sm font-semibold' : 'px-4 py-2 font-medium';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`rounded-md transition-colors ${sizeClass} ${isDark
                ? 'bg-blue-600/80 hover:bg-blue-600 disabled:bg-slate-700 text-white'
                : 'bg-blue-500/80 hover:bg-blue-500 disabled:bg-gray-300 text-white'
                }`}
        >
            Inserir Dados
        </button>
    );
}
