// components/LimitReachedModal.tsx
// Modal mostrando que o usuário atingiu o limite de uso do seu plano

interface LimitReachedModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string; // ex: "Upload de Excel", "Análise com IA"
    currentPlan: 'free' | 'premium' | 'diamond';
    used: number;
    limit: number;
    onUpgrade: () => void;
}

export default function LimitReachedModal({
    isOpen,
    onClose,
    featureName,
    currentPlan,
    used,
    limit,
    onUpgrade
}: LimitReachedModalProps) {
    if (!isOpen) return null;

    const upgradePlans = {
        free: 'premium',
        premium: 'diamond',
        diamond: 'diamond'
    };

    const benefitsByFeature: Record<string, Record<string, string>> = {
        'Upload de Excel': {
            premium: 'Uploads ilimitados',
            diamond: 'Uploads ilimitados'
        },
        'Análise com IA': {
            premium: '5 análises/mês',
            diamond: 'Análises ilimitadas'
        },
        'Exportar PDF': {
            premium: '5 exportações/mês',
            diamond: 'Exportações ilimitadas'
        }
    };

    const nextPlan = upgradePlans[currentPlan];
    const benefit = benefitsByFeature[featureName]?.[nextPlan] || 'Mais recursos';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header com Gradient */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔐</span>
                        <h2 className="text-xl font-bold text-white">Limite Atingido</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <p className="text-slate-300 text-sm mb-4">
                        Você atingiu o limite de <strong>{featureName}</strong> no seu plano <strong className="text-amber-400">{currentPlan.toUpperCase()}</strong>.
                    </p>

                    {/* Usage Counter */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded p-3 mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-100 mb-1">
                                {used} de {limit}
                            </div>
                            <div className="text-xs text-slate-400">Usados este mês</div>
                        </div>
                    </div>

                    {/* Upgrade Info */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded p-3 mb-4">
                        <p className="text-xs text-slate-300 mb-2">
                            <strong>Com {nextPlan === 'diamond' ? 'Diamond' : 'Premium'}:</strong>
                        </p>
                        <p className="text-sm text-emerald-400 font-semibold">
                            {benefit}
                        </p>
                    </div>

                    <p className="text-xs text-slate-400">
                        💡 Seu limite reseta no 1º do próximo mês
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-800/30 border-t border-slate-700 px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800/50 transition text-slate-300 text-sm font-medium"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={onUpgrade}
                        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition text-white text-sm font-semibold"
                    >
                        Fazer Upgrade
                    </button>
                </div>
            </div>
        </div>
    );
}
