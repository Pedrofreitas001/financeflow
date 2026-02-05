// components/DownloadTemplateButton.tsx
// Botão compacto para baixar o modelo Excel (mesmo link do CTA).

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface DownloadTemplateButtonProps {
    href: string;
    label?: string;
}

export default function DownloadTemplateButton({ href, label = 'Baixar modelo' }: DownloadTemplateButtonProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <a
            href={href}
            download
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200
                ${isDark
                    ? 'bg-slate-600/80 hover:bg-slate-600 text-white'
                    : 'bg-slate-500 hover:bg-slate-600 text-white'
                }`}
        >
            <span className="material-symbols-outlined text-base">download</span>
            {label}
        </a>
    );
}
