// components/DataInputSelector.tsx
// Modal para escolher entre Manual ou Google Sheets (mesmo estilo PremiumModal)

import { useState } from 'react';
import { useUserPlan } from '@/hooks/useUserPlan';

interface DataInputSelectorProps {
    userId: string;
    dashboardType: string;
    onManual: () => void;
    onGoogleSheets: () => void;
    onClose: () => void;
}

export default function DataInputSelector({
    userId,
    dashboardType,
    onManual,
    onGoogleSheets,
    onClose
}: DataInputSelectorProps) {
    const { userPlan } = useUserPlan(userId);
    const [selectedOption, setSelectedOption] = useState<'manual' | 'google' | null>(null);

    const canUseGoogle = userPlan.isPremium || userPlan.isDiamond;

    const handleManualClick = () => {
        setSelectedOption('manual');
        onManual();
    };

    const handleGoogleClick = () => {
        if (canUseGoogle) {
            setSelectedOption('google');
            onGoogleSheets();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header com Gradient */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Inserir Dados</h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-2xl leading-none"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <p className="text-slate-300 text-sm mb-5">
                        Escolha como você quer inserir dados para <strong>{dashboardType}</strong>
                    </p>

                    <div className="space-y-3">
                        {/* Opção 1: Manual Excel */}
                        <button
                            onClick={handleManualClick}
                            className="w-full p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 hover:border-emerald-500/50 transition text-left group"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl group-hover:scale-110 transition">📊</span>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-100 text-sm">Upload Manual (Excel)</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Faça upload de um arquivo Excel com seus dados
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Opção 2: Google Sheets */}
                        <button
                            onClick={handleGoogleClick}
                            disabled={!canUseGoogle}
                            className={`w-full p-4 rounded-lg border transition text-left group ${canUseGoogle
                                    ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 hover:border-blue-500/50'
                                    : 'border-slate-700 bg-slate-800/20 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`text-2xl ${canUseGoogle ? 'group-hover:scale-110' : ''} transition`}>
                                    🔗
                                </span>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-100 text-sm">Google Sheets</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Sincronizar dados de uma planilha Google
                                    </p>
                                    {!canUseGoogle && (
                                        <p className="text-xs text-amber-400 mt-2 font-medium">
                                            Requer plano Premium ou Diamond
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Plan Info */}
                    <div className="mt-5 p-3 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                        <p>
                            <strong>Seu plano:</strong> <span className="text-emerald-400 font-semibold">{userPlan.plan.toUpperCase()}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
