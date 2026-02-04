// components/DataUploadModal.tsx
// Modal para escolher entre Upload Manual ou Google Sheets

import React, { useState } from 'react';
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
    const [showGoogleSheetsSelector, setShowGoogleSheetsSelector] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                <div className="relative w-full max-w-md bg-[#1a2942] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10 overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white/60">close</span>
                    </button>

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm mb-3">
                            <span className="material-symbols-outlined text-3xl text-white">upload_file</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Carregar Dados</h2>
                        <p className="text-xs text-white/80">Como deseja inserir dados para {dashboardType}?</p>
                    </div>

                    <div className="p-6">
                        <div className="space-y-3 mb-5">
                            <button
                                onClick={() => {
                                    onManualUpload();
                                    onClose();
                                }}
                                className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                            >
                                Upload Manual
                            </button>

                            <button
                                onClick={() => {
                                    setShowGoogleSheetsSelector(true);
                                }}
                                className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
                            >
                                Google Sheets
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2.5 rounded-lg font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

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
