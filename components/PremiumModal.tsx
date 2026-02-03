import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    description: string;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, feature, description }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300
                ${isDark ? 'bg-surface-dark border border-border-dark' : 'bg-white'}`}>

                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-2">
                        <span className="material-symbols-outlined text-2xl text-white">workspace_premium</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">Recurso Premium</h2>
                    <p className="text-xs text-blue-100">Faça upgrade para desbloquear</p>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className={`rounded-xl p-3 mb-3 ${isDark ? 'bg-background-dark' : 'bg-blue-50'}`}>
                        <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {feature}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {description}
                        </p>
                    </div>

                    {/* Benefícios Premium */}
                    <div className="space-y-1.5 mb-3">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                            <div>
                                <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Upload Ilimitado de Excel
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                            <div>
                                <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Insights com IA Avançada
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                            <div>
                                <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Exportação PDF Profissional
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                            <div>
                                <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Histórico Completo
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className={`rounded-xl p-4 mb-4 text-center border-2 ${isDark ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'}`}>
                        <div className="flex items-baseline justify-center gap-1 mb-1">
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>R$ 97</span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/mês</span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            ou R$ 970/ano (2 meses grátis)
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
                                ${isDark
                                    ? 'bg-surface-dark hover:bg-background-dark text-gray-300 border border-border-dark'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                        >
                            Agora Não
                        </button>
                        <button
                            onClick={() => {
                                // TODO: Integrar com página de pagamento
                                window.location.href = '/dashboard?page=settings&tab=subscription';
                            }}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            Fazer Upgrade
                        </button>
                    </div>

                    {/* Trial notice */}
                    <p className={`text-center text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        💎 7 dias de teste grátis • Cancele quando quiser
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors
                        ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-white'}`}
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>
        </div>
    );
};

export default PremiumModal;
