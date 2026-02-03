import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoggedNavbar: React.FC = () => {
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fechar menu quando clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/';
    };

    const getInitials = () => {
        const name = user?.user_metadata?.name || user?.email || 'U';
        return name.charAt(0).toUpperCase();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1d32]/95 backdrop-blur-lg shadow-lg">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">F</span>
                        </div>
                        <span className="text-xl font-bold text-white">FinanceFlow</span>
                    </Link>

                    {/* Centered Navigation Links */}
                    <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
                        <a href="#" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                            Home
                        </a>
                        <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                            Recursos
                        </a>
                        <a href="#how-it-works" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                            Como Funciona
                        </a>
                        <a href="#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                            Preços
                        </a>
                        <a href="#faq" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                            FAQ
                        </a>
                        <a href="#contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                            Contato
                        </a>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                                {getInitials()}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-white">
                                    {user?.user_metadata?.name || 'Usuário'}
                                </p>
                                <p className="text-xs text-white/60">{user?.email}</p>
                            </div>
                            <svg
                                className={`w-4 h-4 text-white/60 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-[#1a2942] rounded-xl shadow-xl border border-white/10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-white/10">
                                    <p className="text-sm font-semibold text-white">
                                        {user?.user_metadata?.name || 'Usuário'}
                                    </p>
                                    <p className="text-xs text-white/60 truncate">{user?.email}</p>
                                </div>

                                <div className="py-2">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-blue-400 text-xl">dashboard</span>
                                        <div>
                                            <p className="text-sm font-medium text-white">Dashboard</p>
                                            <p className="text-xs text-white/60">Análises e relatórios</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/dashboard?page=settings&tab=profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-white/60 text-xl">person</span>
                                        <div>
                                            <p className="text-sm font-medium text-white">Perfil</p>
                                            <p className="text-xs text-white/60">Dados pessoais</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/dashboard?page=settings&tab=subscription"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-white/60 text-xl">settings</span>
                                        <div>
                                            <p className="text-sm font-medium text-white">Configurações</p>
                                            <p className="text-xs text-white/60">Preferências e planos</p>
                                        </div>
                                    </Link>
                                </div>

                                <div className="border-t border-white/10 pt-2">
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-red-900/20 transition-colors text-left"
                                    >
                                        <span className="material-symbols-outlined text-red-400 text-xl">logout</span>
                                        <div>
                                            <p className="text-sm font-medium text-red-400">Sair da Conta</p>
                                            <p className="text-xs text-red-300/60">Desconectar do sistema</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default LoggedNavbar;
