import React from 'react';
import { Link } from 'react-router-dom';

interface QuickSignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuickSignupModal: React.FC<QuickSignupModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#1a2942] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-white/60">close</span>
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center rounded-t-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                        <span className="material-symbols-outlined text-4xl text-white">rocket_launch</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Comece Grátis Agora!</h2>
                    <p className="text-blue-100">Crie sua conta em menos de 1 minuto</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                            </div>
                            <p className="text-white text-sm">Acesso imediato ao dashboard completo</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                            </div>
                            <p className="text-white text-sm">Dados de exemplo pré-carregados</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                            </div>
                            <p className="text-white text-sm">7 dias de teste premium grátis</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                            </div>
                            <p className="text-white text-sm">Sem cartão de crédito necessário</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <Link
                            to="/login"
                            className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                            Criar Conta Grátis
                        </Link>
                        <p className="text-center text-xs text-white/60">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickSignupModal;
