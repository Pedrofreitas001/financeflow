import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateCTAProps {
    title: string;
    description: string;
    formatInfo: {
        fileName: string;
        columns: Array<{
            name: string;
            type: string;
            example: string;
        }>;
    };
    downloadLink: string;
}

const EmptyStateCTA: React.FC<EmptyStateCTAProps> = ({ title, description, formatInfo, downloadLink }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-slate-50'}`}>
            <div className={`flex-1 overflow-y-auto custom-scrollbar flex items-center justify-center relative`} style={{
                backgroundColor: isDark ? '#0a1628' : '#f1f5f9',
                backgroundImage: isDark
                    ? `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59, 130, 246, 0.35) 0%, rgba(37, 99, 235, 0.18) 40%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.25) 0%, transparent 50%), radial-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px)`
                    : `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 40%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.12) 0%, transparent 50%), radial-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px)`,
                backgroundSize: '100% 100%, 100% 100%, 24px 24px'
            }}>
                <div className="max-w-2xl w-full mx-auto px-8">
                    <div className="flex flex-col items-center justify-center text-center mb-8">
                        <h2 data-cta-header className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {title}
                        </h2>
                        <p data-cta-text className={isDark ? 'text-gray-300' : 'text-slate-600'}>
                            {description}
                        </p>
                    </div>

                    {/* Informações do Formato */}
                    <div className={`rounded-2xl border shadow-lg p-6 ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'}`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <span className="material-symbols-outlined text-blue-500">description</span>
                            Formato Esperado: {formatInfo.fileName}
                        </h3>
                        <div className={`rounded-lg p-4 mb-4 overflow-x-auto ${isDark ? 'bg-background-dark/50' : 'bg-gray-50'}`}>
                            <table className="text-xs w-full">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'text-gray-400 border-border-dark' : 'text-gray-600 border-gray-300'}`}>
                                        <th className="text-left py-2">Coluna</th>
                                        <th className="text-left py-2">Tipo</th>
                                        <th className="text-left py-2">Exemplo</th>
                                    </tr>
                                </thead>
                                <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                    {formatInfo.columns.map((col, idx) => (
                                        <tr key={idx} className={`${isDark ? 'border-b border-border-dark/50' : 'border-b border-gray-200'}`}>
                                            <td className="py-2 font-mono text-blue-500">{col.name}</td>
                                            <td>{col.type}</td>
                                            <td>{col.example}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Arquivo: <span className="text-blue-500 font-mono">{formatInfo.fileName}</span>
                        </p>

                        {/* Botão Download com azul mais claro */}
                        <a
                            data-cta-button
                            href={downloadLink}
                            download
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-full
                                ${isDark
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-base">download</span>
                            Baixar Arquivo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyStateCTA;
