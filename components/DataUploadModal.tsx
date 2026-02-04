// components/DataUploadModal.tsx
// Modal para escolher entre Upload Manual ou Google Sheets (estilo PremiumModal)

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { GoogleSheetsSelector } from './GoogleSheetsSelector';
import { type DashboardType } from '@/utils/dataHistoryManager';

interface DataUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    dashboardType: DashboardType;
    onManualUpload: () => void;
    onGoogleSheets: (data: any[]) => void;
}

export default function DataUploadModal({
    isOpen,
    onClose,
    dashboardType,
    onManualUpload,
    onGoogleSheets,
}: DataUploadModalProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showGoogleSheetsSelector, setShowGoogleSheetsSelector] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className={`relative w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden
                    ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>
                    {/* Header com gradiente */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-2">
                            <span className="material-symbols-outlined text-2xl text-white">upload_file</span>
                        </div>
                        <h2 className="text-lg font-bold text-white mb-1">Carregar Dados</h2>
                        <p className="text-xs text-blue-100">Como deseja inserir dados para {dashboardType}?</p>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="space-y-3 mb-4">
                            {/* Opção 1: Upload Manual */}
                            <button
                                onClick={() => {
                                    onManualUpload();
                                    onClose();
                                }}
                                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors
                                    ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                Upload Manual
                            </button>

                            {/* Opção 2: Google Sheets */}
                            <button
                                onClick={() => {
                                    setShowGoogleSheetsSelector(true);
                                }}
                                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors
                                    ${isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                            >
                                Google Sheets
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors border
                                ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Google Sheets Selector */}
            <GoogleSheetsSelector
                isOpen={showGoogleSheetsSelector}
                onClose={() => setShowGoogleSheetsSelector(false)}
                dashboardType={dashboardType}
                onDataLoaded={(data) => {
                    onGoogleSheets(data);
                    setShowGoogleSheetsSelector(false);
                    onClose();
                }}
            />
        </>
    );
}
