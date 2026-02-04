import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DataHistoryTab from './DataHistoryTab';
import SavedDashboardHistoryViewer from './SavedDashboardHistoryViewer';
import InsightsManager from './InsightsManager';

const DashboardSettings: React.FC = () => {
    const { theme } = useTheme();
    const { user, signOut } = useAuth();
    const isDark = theme === 'dark';
    const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'preferences' | 'business' | 'data-history' | 'insights'>('profile');

    // Estados para o perfil
    const [profileData, setProfileData] = useState({
        name: user?.user_metadata?.name || 'Usuário',
        email: user?.email || '',
        company: 'Minha Empresa',
        phone: '',
        avatar: ''
    });

    // Estados para contexto empresarial (usado nas análises de IA)
    const [businessContext, setBusinessContext] = useState({
        segmento: localStorage.getItem('business_segment') || '',
        localizacao: localStorage.getItem('business_location') || '',
        porteEmpresa: localStorage.getItem('business_size') || '',
        anoFundacao: localStorage.getItem('business_year') || '',
        numeroFuncionarios: localStorage.getItem('business_employees') || '',
        observacoes: localStorage.getItem('business_notes') || ''
    });

    const saveBusinessContext = () => {
        localStorage.setItem('business_segment', businessContext.segmento);
        localStorage.setItem('business_location', businessContext.localizacao);
        localStorage.setItem('business_size', businessContext.porteEmpresa);
        localStorage.setItem('business_year', businessContext.anoFundacao);
        localStorage.setItem('business_employees', businessContext.numeroFuncionarios);
        localStorage.setItem('business_notes', businessContext.observacoes);
        alert('Contexto empresarial salvo! Será usado nas análises de IA.');
    };

    // Dados de assinatura (mockado)
    const [subscriptionData] = useState({
        plan: 'free',
        status: 'trial',
        trialDaysLeft: 7,
        nextBilling: '10/02/2026',
        price: 0
    });

    const isPremium = subscriptionData.plan === 'premium';

    return (
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-slate-50'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Configurações
                    </h1>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Gerencie sua conta, assinatura e preferências
                    </p>
                </div>

                {/* Tabs */}
                <div className={`flex flex-wrap gap-1 mb-6 border-b ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                    {[
                        { id: 'profile', label: 'Perfil', icon: 'person' },
                        { id: 'business', label: 'Contexto Empresarial', icon: 'business' },
                        { id: 'subscription', label: 'Assinatura', icon: 'workspace_premium' },
                        { id: 'preferences', label: 'Preferências', icon: 'settings' },
                        { id: 'data-history', label: 'Histórico de Dados', icon: 'history' },
                        { id: 'insights', label: 'Insights Salvos', icon: 'lightbulb' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-500'
                                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className={`rounded-2xl border shadow-lg p-8 ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'}`}>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Informações do Perfil
                            </h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                        Alterar Foto
                                    </button>
                                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        JPG, PNG ou GIF. Máx 2MB
                                    </p>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors opacity-60 ${isDark
                                            ? 'bg-background-dark/50 border-border-dark text-gray-400'
                                            : 'bg-gray-100 border-gray-300 text-gray-600'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Empresa
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.company}
                                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        placeholder="(11) 99999-9999"
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex gap-3 pt-4">
                                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                                    Salvar Alterações
                                </button>
                                <button
                                    onClick={signOut}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isDark
                                        ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50'
                                        : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                        }`}
                                >
                                    Sair da Conta
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Business Context Tab */}
                    {activeTab === 'business' && (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Contexto Empresarial
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    🤖 Essas informações ajudam a IA a gerar análises mais precisas e personalizadas
                                </p>
                            </div>

                            {/* Form */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Segmento de Negócio *
                                    </label>
                                    <select
                                        value={businessContext.segmento}
                                        onChange={(e) => setBusinessContext({ ...businessContext, segmento: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Tecnologia">Tecnologia / SaaS</option>
                                        <option value="Varejo">Varejo</option>
                                        <option value="Serviços">Serviços</option>
                                        <option value="Indústria">Indústria</option>
                                        <option value="Alimentos">Alimentos & Bebidas</option>
                                        <option value="Educação">Educação</option>
                                        <option value="Saúde">Saúde</option>
                                        <option value="Construção">Construção</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Localização (Cidade/Estado) *
                                    </label>
                                    <input
                                        type="text"
                                        value={businessContext.localizacao}
                                        onChange={(e) => setBusinessContext({ ...businessContext, localizacao: e.target.value })}
                                        placeholder="Ex: São Paulo, SP"
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Porte da Empresa
                                    </label>
                                    <select
                                        value={businessContext.porteEmpresa}
                                        onChange={(e) => setBusinessContext({ ...businessContext, porteEmpresa: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="MEI">MEI</option>
                                        <option value="Microempresa">Microempresa (até 9 funcionários)</option>
                                        <option value="Pequena">Pequena (10-49 funcionários)</option>
                                        <option value="Média">Média (50-249 funcionários)</option>
                                        <option value="Grande">Grande (250+ funcionários)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Ano de Fundação
                                    </label>
                                    <input
                                        type="number"
                                        value={businessContext.anoFundacao}
                                        onChange={(e) => setBusinessContext({ ...businessContext, anoFundacao: e.target.value })}
                                        placeholder="2020"
                                        min="1900"
                                        max="2026"
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Número de Funcionários
                                    </label>
                                    <input
                                        type="number"
                                        value={businessContext.numeroFuncionarios}
                                        onChange={(e) => setBusinessContext({ ...businessContext, numeroFuncionarios: e.target.value })}
                                        placeholder="Ex: 25"
                                        min="0"
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDark
                                            ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Observações / Contexto Adicional
                                </label>
                                <textarea
                                    value={businessContext.observacoes}
                                    onChange={(e) => setBusinessContext({ ...businessContext, observacoes: e.target.value })}
                                    placeholder="Ex: Empresa em fase de expansão, foco em vendas B2B, sazonalidade em dezembro..."
                                    rows={4}
                                    className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${isDark
                                        ? 'bg-background-dark border-border-dark text-white focus:border-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                />
                                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Adicione informações relevantes que podem ajudar a IA a entender melhor seu negócio
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex gap-3">
                                    <span className="material-symbols-outlined text-blue-500">info</span>
                                    <div>
                                        <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                            Por que esses dados são importantes?
                                        </p>
                                        <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                            A IA usa essas informações para contextualizar análises, comparar com benchmarks do setor,
                                            e dar recomendações específicas para o seu tipo de negócio e localização.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={saveBusinessContext}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    💾 Salvar Configurações
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Subscription Tab */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-6">
                            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Planos e Assinatura
                            </h2>

                            {/* Current Plan */}
                            <div className={`rounded-xl p-6 border-2 ${isPremium
                                ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500'
                                : isDark
                                    ? 'bg-background-dark border-border-dark'
                                    : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {isPremium ? 'Plano Premium' : 'Plano Gratuito'}
                                            </h3>
                                            {subscriptionData.status === 'trial' && (
                                                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                                                    {subscriptionData.trialDaysLeft} dias de teste
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {isPremium
                                                ? 'Acesso completo a todos os recursos'
                                                : 'Acesso limitado com dados de exemplo'
                                            }
                                        </p>
                                    </div>
                                    {isPremium && (
                                        <span className="material-symbols-outlined text-4xl text-yellow-500">
                                            workspace_premium
                                        </span>
                                    )}
                                </div>

                                {!isPremium && subscriptionData.status === 'trial' && (
                                    <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border border-amber-900/50' : 'bg-amber-50 border border-amber-200'}`}>
                                        <p className={`text-sm font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                                            ⏱️ Seu teste grátis expira em {subscriptionData.trialDaysLeft} dias
                                        </p>
                                        <p className={`text-xs mt-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                                            Faça upgrade agora e ganhe 20% de desconto no primeiro mês!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Plans Comparison */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Free Plan */}
                                <div className={`rounded-xl p-6 border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'}`}>
                                    <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Gratuito
                                    </h4>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>R$ 0</span>
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/mês</span>
                                    </div>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Dados de exemplo interativos
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Dashboards básicos
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">cancel</span>
                                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Sem upload de Excel
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">cancel</span>
                                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Sem insights de IA
                                            </span>
                                        </li>
                                    </ul>
                                    <button
                                        disabled={!isPremium}
                                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${!isPremium
                                            ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                                            }`}
                                    >
                                        {!isPremium ? 'Plano Atual' : 'Downgrade'}
                                    </button>
                                </div>

                                {/* Premium Plan */}
                                <div className={`rounded-xl p-6 border-2 bg-gradient-to-br ${isDark
                                    ? 'from-blue-900/40 to-indigo-900/40 border-blue-500'
                                    : 'from-blue-50 to-indigo-50 border-blue-400'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            Premium
                                        </h4>
                                        <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                                            POPULAR
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>R$ 97</span>
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/mês</span>
                                    </div>
                                    <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        ou R$ 970/ano (2 meses grátis)
                                    </p>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Upload ilimitado de Excel
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Insights com IA Gemini
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Exportação PDF profissional
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Histórico completo
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Suporte prioritário
                                            </span>
                                        </li>
                                    </ul>
                                    <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                                        {isPremium ? 'Gerenciar Assinatura' : 'Fazer Upgrade Agora'}
                                    </button>
                                    <p className={`text-center text-xs mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        💳 Cancele quando quiser
                                    </p>
                                </div>
                            </div>

                            {/* Billing History */}
                            {isPremium && (
                                <div>
                                    <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Histórico de Pagamentos
                                    </h3>
                                    <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                                        <table className="w-full">
                                            <thead className={isDark ? 'bg-background-dark' : 'bg-gray-50'}>
                                                <tr>
                                                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Data
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Descrição
                                                    </th>
                                                    <th className={`px-4 py-3 text-right text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Valor
                                                    </th>
                                                    <th className={`px-4 py-3 text-center text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className={isDark ? 'bg-surface-dark' : 'bg-white'}>
                                                <tr className={`border-t ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
                                                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        10/01/2026
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Plano Premium - Janeiro/2026
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        R$ 97,00
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                            Pago
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Preferências
                            </h2>

                            {/* Notifications */}
                            <div>
                                <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Notificações
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Email sobre novos insights', description: 'Receba quando a IA gerar novos insights' },
                                        { label: 'Alertas de despesas', description: 'Notificações sobre gastos acima do normal' },
                                        { label: 'Atualizações do sistema', description: 'Novos recursos e melhorias' },
                                        { label: 'Newsletter semanal', description: 'Resumo semanal dos seus dados' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-background-dark border-border-dark' : 'bg-gray-50 border-gray-200'}`}>
                                            <div>
                                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Management */}
                            <div>
                                <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Gerenciamento de Dados
                                </h3>
                                <div className="space-y-3">
                                    <button className={`w-full px-4 py-3 rounded-lg font-semibold text-left flex items-center justify-between transition-colors ${isDark
                                        ? 'bg-background-dark hover:bg-gray-800 text-white border border-border-dark'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-blue-500">download</span>
                                            <div>
                                                <p className="font-semibold">Exportar Todos os Dados</p>
                                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Baixe todos os seus dados em formato JSON</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>

                                    <button className={`w-full px-4 py-3 rounded-lg font-semibold text-left flex items-center justify-between transition-colors ${isDark
                                        ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50'
                                        : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined">delete_forever</span>
                                            <div>
                                                <p className="font-semibold">Excluir Conta</p>
                                                <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-500'}`}>Esta ação é irreversível</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data History Tab */}
                    {activeTab === 'data-history' && user?.id && (
                        <div className="space-y-8">
                            <div>
                                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Versoes Salvas
                                </h3>
                                <SavedDashboardHistoryViewer variant={isDark ? 'dark' : 'light'} />
                            </div>

                            <div>
                                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Google Sheets
                                </h3>
                                <DataHistoryTab userId={user.id} dashboardType="despesas" variant={isDark ? 'dark' : 'light'} />
                            </div>
                        </div>
                    )}

                    {/* Insights Tab */}
                    {activeTab === 'insights' && user?.id && (
                        <InsightsManager userId={user.id} dashboardType="despesas" />
                    )}
                </div>
            </div>
        </main>
    );
};

export default DashboardSettings;
