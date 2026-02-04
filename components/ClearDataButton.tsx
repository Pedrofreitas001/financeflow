import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ClearDataButtonProps {
    onClear: () => void;
    disabled?: boolean;
    label?: string;
}

const ClearDataButton: React.FC<ClearDataButtonProps> = ({
    onClear,
    disabled = false,
    label = 'Limpar Dados'
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handleClear = () => {
        if (!confirm('Tem certeza que deseja limpar os dados da interface?')) return;
        onClear();
    };

    return (
        <button
            onClick={handleClear}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200
                ${disabled
                    ? isDark
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                        ? 'bg-red-600/70 hover:bg-red-600 text-white'
                        : 'bg-red-600/70 hover:bg-red-600 text-white'
                }
            `}
        >
            <span className="material-symbols-outlined">delete_forever</span>
            {label}
        </button>
    );
};

export default ClearDataButton;
