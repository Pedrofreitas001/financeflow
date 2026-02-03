import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoggedNavbar from '../components/LoggedNavbar';
import QuickSignupModal from '../components/QuickSignupModal';

interface GalleryImage {
    src: string;
    alt: string;
}

const VideoCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const features = [
        {
            title: 'Dashboard Principal',
            description: 'Visualize todos os dados financeiros em um painel intuitivo e personalizável com gráficos dinâmicos que se atualizam em tempo real.'
        },
        {
            title: 'Análise de Despesas',
            description: 'Controle detalhado de todas as despesas com categorização automática e insights de IA para otimizar gastos.'
        },
        {
            title: 'DRE Completo',
            description: 'Demonstrativo de Resultados do Exercício com análises comparativas mensais, trimestrais e anuais automáticas.'
        },
        {
            title: 'Fluxo de Caixa',
            description: 'Projeções precisas e análises de fluxo de caixa para melhor planejamento financeiro da sua empresa.'
        },
        {
            title: 'Indicadores e KPIs',
            description: 'Acompanhe os principais indicadores financeiros com dashboards executivos prontos para apresentações.'
        },
        {
            title: 'Relatórios em PDF',
            description: 'Gere relatórios profissionais e personalizáveis em PDF com um clique, prontos para stakeholders.'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-lg border border-blue-500/30 p-6 min-h-48">
            <div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                    {features[currentIndex].title}
                </h3>
                <p className="text-white/70 text-base leading-relaxed mb-6">
                    {features[currentIndex].description}
                </p>
            </div>

            <div className="mt-6">
                <div className="flex gap-2">
                    {features.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'bg-blue-400 w-6' : 'bg-white/20 w-3'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-sm text-white/50 mt-3 inline-block">{currentIndex + 1} de {features.length}</span>
            </div>
        </div>
    );
};

const GalleryGrid: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const images: GalleryImage[] = [
        { src: '/dashboard financeiro.png', alt: 'Dashboard Financeiro' },
        { src: '/dashboard fiannceiro 2.png', alt: 'Dashboard Financeiro 2' },
        { src: '/analise de despesas.png', alt: 'Análise de Despesas' },
        { src: '/analise de despesas 2.png', alt: 'Análise de Despesas 2' },
        { src: '/DRE.png', alt: 'DRE' },
        { src: '/balancete .png', alt: 'Balancete' }
    ];

    return (
        <>
            <div className="grid md:grid-cols-3 gap-6">
                {images.map((image, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedImage(image.src)}
                        className="cursor-pointer group relative overflow-hidden rounded-md border border-white/10 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                                zoom_in
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-[#162944] rounded-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage}
                            alt="Expandida"
                            className="w-full h-full object-contain"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-white">close</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const Home: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: 'dashboard',
            title: 'Dashboards Interativos',
            description: 'Visualize todos os dados financeiros em painéis personalizáveis e intuitivos. Gráficos dinâmicos que se atualizam automaticamente.',
        },
        {
            icon: 'upload_file',
            title: 'Upload de Excel Seguro',
            description: 'Importe seus dados contábeis do Excel com total segurança. Criptografia de ponta a ponta para proteger suas informações.',
        },
        {
            icon: 'auto_awesome',
            title: 'Insights com IA',
            description: 'Receba análises inteligentes e sugestões personalizadas sobre seu negócio baseadas em Inteligência Artificial avançada.',
        },
        {
            icon: 'picture_as_pdf',
            title: 'Relatórios em PDF',
            description: 'Gere relatórios profissionais em PDF com um clique. Prontos para apresentar a investidores e stakeholders.',
        },
        {
            icon: 'trending_up',
            title: 'Análise DRE Completa',
            description: 'Demonstrativo de Resultados do Exercício com análises comparativas mensais, trimestrais e anuais.',
        },
        {
            icon: 'account_balance',
            title: 'Balancete Patrimonial',
            description: 'Mapa patrimonial completo com pirâmide de solidez financeira e indicadores de saúde empresarial.',
        }
    ];

    const metrics = [
        { value: '500+', label: 'Empresas Ativas', icon: 'business' },
        { value: '50K+', label: 'Relatórios Gerados', icon: 'description' },
        { value: '99.9%', label: 'Uptime Garantido', icon: 'verified' },
        { value: '4.9★', label: 'Avaliação Média', icon: 'star' }
    ];

    const testimonials = [
        {
            name: 'Ricardo Mendes',
            role: 'CFO, Tech Solutions',
            content: 'O FinanceFlow transformou nossa gestão financeira. Economizamos 20 horas por semana em relatórios manuais.',
            avatar: 'R'
        },
        {
            name: 'Ana Paula Costa',
            role: 'Contadora, AP Contabilidade',
            content: 'A interface é intuitiva e os insights de IA realmente fazem diferença. Recomendo para todos meus clientes.',
            avatar: 'A'
        },
        {
            name: 'Carlos Eduardo Silva',
            role: 'Diretor Financeiro, Grupo Silva',
            content: 'Finalmente uma ferramenta que entende as necessidades de um contador. O melhor investimento que fizemos.',
            avatar: 'C'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f1d32]">
            {/* Navbar - Conditional */}
            {user ? (
                <LoggedNavbar />
            ) : (
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1d32]/95 backdrop-blur-lg shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">F</span>
                                </div>
                                <span className="text-xl font-bold text-white">FinanceFlow</span>
                            </Link>

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

                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                                    Login
                                </Link>
                                {user ? (
                                    <Link to="/dashboard" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-all">
                                        Acessar Dashboard
                                    </Link>
                                ) : (
                                    <button onClick={() => setShowSignupModal(true)} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-all">
                                        Acessar Dashboard
                                    </button>
                                )}
                            </div>

                            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <span className="material-symbols-outlined text-white">
                                    {isMobileMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-[#0f1d32] border-t border-white/10">
                            <div className="px-6 py-4 space-y-3">
                                <a href="#" className="block py-2 text-white/80 font-medium">Home</a>
                                <a href="#features" className="block py-2 text-white/80 font-medium">Recursos</a>
                                <a href="#how-it-works" className="block py-2 text-white/80 font-medium">Como Funciona</a>
                                <a href="#pricing" className="block py-2 text-white/80 font-medium">Preços</a>
                                <a href="#faq" className="block py-2 text-white/80 font-medium">FAQ</a>
                                <a href="#contact" className="block py-2 text-white/80 font-medium">Contato</a>
                                <Link to="/login" className="block py-2 text-white/80 font-medium">Login</Link>
                                {user ? (
                                    <Link to="/dashboard" className="block py-3 px-6 bg-blue-600 text-white text-center font-semibold rounded-lg">
                                        Acessar Dashboard
                                    </Link>
                                ) : (
                                    <button onClick={() => setShowSignupModal(true)} className="block w-full py-3 px-6 bg-blue-600 text-white text-center font-semibold rounded-lg">
                                        Acessar Dashboard
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background Base - Medium navy blue */}
                <div className="absolute inset-0 bg-[#142038]"></div>

                {/* Subtle gradient - darker on left, slightly lighter on right */}
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(110deg, rgba(15, 30, 55, 0.6) 0%, rgba(22, 37, 68, 0.3) 40%, rgba(30, 58, 95, 0.25) 70%, rgba(37, 78, 130, 0.2) 100%)'
                }}></div>

                {/* Soft blue accent top-right - subtle */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 70% 60% at 90% 20%, rgba(59, 130, 200, 0.2) 0%, transparent 60%)'
                }}></div>

                {/* Very subtle glow behind dashboard */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 60% 70% at 75% 50%, rgba(45, 90, 150, 0.15) 0%, transparent 60%)'
                }}></div>

                {/* Laminated vibrant circle - top center-left (main bright) */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 42% 22%, rgba(56, 182, 255, 0.16) 0%, rgba(80, 200, 255, 0.08) 20%, transparent 42%)'
                }}></div>

                {/* Laminated vibrant circle - upper center */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 55% 30%, rgba(80, 190, 255, 0.13) 0%, rgba(100, 210, 255, 0.065) 22%, transparent 45%)'
                }}></div>

                {/* Laminated vibrant circle - center-left */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 48% 46%, rgba(70, 185, 255, 0.11) 0%, rgba(90, 200, 255, 0.06) 24%, transparent 46%)'
                }}></div>

                {/* Laminated vibrant circle - right side */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 72% 35%, rgba(60, 180, 255, 0.12) 0%, transparent 30%)'
                }}></div>

                {/* Laminated vibrant circle - lower center */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 58% 52%, rgba(90, 195, 255, 0.1) 0%, transparent 28%)'
                }}></div>

                {/* Dot Grid Pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}></div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full py-32">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#1a2d4a] border border-blue-500/30 rounded-full px-4 py-2 mb-8">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                <span className="text-white/90 text-sm font-medium">Novo: Insights com IA Generativa</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1]">
                                Dashboard Contábil<br />
                                <span className="text-blue-400">Inteligente</span>
                            </h1>

                            <p className="text-white/60 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg">
                                Transforme seus dados do Excel em dashboards profissionais com insights de IA. A solução completa para gestão financeira moderna.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                {user ? (
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-blue-500 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-xl">rocket_launch</span>
                                        Acessar Dashboard
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowSignupModal(true)}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-blue-500 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-xl">rocket_launch</span>
                                        Acessar Dashboard
                                    </button>
                                )}
                                <a
                                    href="#demo"
                                    className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">play_circle</span>
                                    Ver Demonstração
                                </a>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-white/50">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                                    <span>7 dias grátis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                                    <span>Sem cartão</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                                    <span>Cancele quando quiser</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Dashboard Preview */}
                        <div className="relative">
                            {/* Glow effect behind mockup */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-blue-600/10 to-transparent rounded-3xl blur-2xl"></div>

                            <div className="relative z-10 bg-gradient-to-br from-[#1e3654] to-[#152238] rounded-xl p-1 border border-white/15 shadow-2xl shadow-blue-900/30">
                                {/* Browser Header */}
                                <div className="flex items-center gap-3 px-4 py-3 bg-[#182d4a]/90 rounded-t-lg">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                                    </div>
                                    <div className="flex-1 ml-4">
                                        <div className="bg-[#0d1829] rounded-lg px-4 py-2 text-xs text-white/40 inline-block">
                                            app.financeflow.com.br/dashboard
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="bg-[#0f1a2e] rounded-b-lg p-6">
                                    <div className="flex gap-5">
                                        {/* Mini Sidebar */}
                                        <div className="flex flex-col items-center gap-4 pt-1">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                                <span className="text-white text-sm font-bold">F</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white/10"></div>
                                            <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                            <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1">
                                            {/* KPIs */}
                                            <div className="grid grid-cols-4 gap-3 mb-6">
                                                <div className="bg-[#182d4a]/70 rounded-lg p-3 border border-white/5">
                                                    <div className="text-[10px] text-white/50 mb-1 font-medium">Receita</div>
                                                    <div className="text-sm font-bold text-emerald-400">R$ 1.2M</div>
                                                </div>
                                                <div className="bg-[#182d4a]/70 rounded-lg p-3 border border-white/5">
                                                    <div className="text-[10px] text-white/50 mb-1 font-medium">Despesas</div>
                                                    <div className="text-sm font-bold text-red-400">R$ 890K</div>
                                                </div>
                                                <div className="bg-[#182d4a]/70 rounded-lg p-3 border border-white/5">
                                                    <div className="text-[10px] text-white/50 mb-1 font-medium">Lucro</div>
                                                    <div className="text-sm font-bold text-blue-400">R$ 310K</div>
                                                </div>
                                                <div className="bg-[#182d4a]/70 rounded-lg p-3 border border-white/5">
                                                    <div className="text-[10px] text-white/50 mb-1 font-medium">Margem</div>
                                                    <div className="text-sm font-bold text-purple-400">25.8%</div>
                                                </div>
                                            </div>

                                            {/* Charts */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#182d4a]/70 rounded-lg p-4 border border-white/5">
                                                    <div className="text-[10px] text-white/50 mb-3 font-medium">Evolução Mensal</div>
                                                    <div className="flex items-end gap-1.5 h-24">
                                                        {[30, 45, 35, 55, 50, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"
                                                                style={{ height: `${h}%` }}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-[#182d4a]/70 rounded-lg p-4 border border-white/5">
                                                    <div className="text-[10px] text-white/50 mb-3 font-medium">Distribuição</div>
                                                    <div className="flex items-center justify-center h-24">
                                                        <div className="relative w-20 h-20">
                                                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                                <circle cx="18" cy="18" r="14" fill="none" stroke="#1e3a5f" strokeWidth="4" />
                                                                <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="50 100" strokeLinecap="round" />
                                                                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-50" strokeLinecap="round" />
                                                                <circle cx="18" cy="18" r="14" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-75" strokeLinecap="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {metrics.map((metric, index) => (
                            <div key={index} className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-600 text-xl">{metric.icon}</span>
                                </div>
                                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{metric.value}</div>
                                <div className="text-slate-500 text-sm">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-slate-200 rounded-full px-4 py-2 mb-4">
                            <span className="material-symbols-outlined text-slate-700 text-sm">star</span>
                            <span className="text-slate-700 text-sm font-semibold">Recursos Premium</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Tudo que você precisa
                            <span className="block">para uma gestão financeira</span>
                            <span className="block text-slate-700">profissional</span>
                        </h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Ferramentas poderosas para transformar dados complexos em insights acionáveis
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-white text-xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section id="demo" className="py-24 bg-[#0f1d32]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Veja o FinanceFlow <span className="text-blue-400">em Ação</span>
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Explore os diferentes módulos e veja como o FinanceFlow pode transformar sua gestão financeira
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            { title: 'Dashboard Principal', desc: 'Visão geral completa', icon: 'dashboard' },
                            { title: 'Análise de Despesas', desc: 'Controle detalhado', icon: 'receipt_long' },
                            { title: 'DRE Completo', desc: 'Demonstrativo de Resultados', icon: 'assessment' },
                            { title: 'Fluxo de Caixa', desc: 'Projeções e análises', icon: 'account_balance_wallet' },
                            { title: 'Indicadores', desc: 'KPIs e métricas', icon: 'speed' },
                            { title: 'Orçamento', desc: 'Planejamento financeiro', icon: 'savings' }
                        ].map((module, index) => (
                            <Link
                                key={index}
                                to="/dashboard"
                                className="group relative bg-[#162944] rounded-xl p-6 border border-white/10 hover:border-blue-500/50 hover:bg-[#1a3354] transition-all"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                                    <span className="material-symbols-outlined text-blue-400 group-hover:text-blue-300 text-xl transition-colors">{module.icon}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">{module.title}</h3>
                                <p className="text-white/50 text-sm">{module.desc}</p>
                                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-blue-400 text-lg">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-blue-500 transition-all"
                        >
                            <span className="material-symbols-outlined">play_arrow</span>
                            Explorar Dashboard Completo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-24 bg-[#0f1d32]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Galeria do Dashboard
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Confira as capturas de tela dos principais módulos do FinanceFlow
                        </p>
                    </div>

                    <GalleryGrid />
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-[#0f1d32]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            O que nossos <span className="text-blue-400">clientes</span> dizem
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-[#162944] rounded-2xl p-8 border border-white/10">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined text-amber-400 text-lg">star</span>
                                    ))}
                                </div>
                                <p className="text-white/80 leading-relaxed mb-6">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{testimonial.name}</div>
                                        <div className="text-sm text-white/50">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                            Comece Gratuitamente
                        </h2>
                        <p className="text-slate-600 text-base">
                            Experimente todos os recursos por 7 dias, sem compromisso
                        </p>
                    </div>

                    {/* Trial Banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 mb-6 text-center text-white">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-xl">verified</span>
                            <span className="text-lg font-bold">7 Dias Grátis</span>
                        </div>
                        <p className="text-emerald-100 text-sm">Acesso completo a todos os recursos • Sem cartão de crédito</p>
                    </div>

                    <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
                        <div className="p-6 text-center border-b border-slate-100">
                            <div className="text-xs font-medium text-slate-500 mb-1">Após o período de teste</div>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-sm font-medium text-slate-400">R$</span>
                                <span className="text-4xl font-bold text-slate-900">59</span>
                                <span className="text-sm font-medium text-slate-400">,90</span>
                                <span className="text-slate-500 text-sm ml-1">/mês</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <ul className="space-y-2 mb-6">
                                {[
                                    'Upload ilimitado de arquivos Excel',
                                    'Dashboards interativos personalizáveis',
                                    'Análise DRE, Balancete e Cash Flow',
                                    'Insights com Inteligência Artificial',
                                    'Exportação de relatórios em PDF',
                                    'Suporte prioritário por email',
                                    'Cancele quando quiser'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                        <span className="text-slate-700 text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/dashboard"
                                className="block w-full text-center bg-blue-600 text-white text-base font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                            >
                                Começar Teste Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Como Funciona
                        </h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Em apenas 3 passos você transforma seus dados contábeis em insights poderosos
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-slate-200"></div>

                        {[
                            {
                                step: '1',
                                icon: 'upload_file',
                                title: 'Faça o Upload',
                                description: 'Importe seus arquivos Excel com os dados contábeis. Suportamos diversos formatos e estruturas.'
                            },
                            {
                                step: '2',
                                icon: 'auto_awesome',
                                title: 'IA Processa',
                                description: 'Nossa IA analisa seus dados, identifica padrões e gera insights personalizados automaticamente.'
                            },
                            {
                                step: '3',
                                icon: 'insights',
                                title: 'Visualize',
                                description: 'Acesse dashboards interativos com gráficos e relatórios prontos para decisões estratégicas.'
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-6 relative z-10">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-slate-600 text-2xl">{item.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-24 bg-[#0f1d32]">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Por que escolher o <span className="text-blue-400">FinanceFlow</span>?
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Compare e veja como o FinanceFlow supera as soluções tradicionais
                        </p>
                    </div>

                    <div className="bg-[#1a3452] rounded-2xl border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-3 bg-[#162944] p-4">
                            <div className="text-white/70 text-sm font-medium">Recurso</div>
                            <div className="text-center text-white/70 text-sm font-medium">Planilhas Manuais</div>
                            <div className="text-center text-blue-400 text-sm font-bold">FinanceFlow</div>
                        </div>
                        {[
                            { feature: 'Tempo de setup', manual: '2-4 semanas', ff: '5 minutos' },
                            { feature: 'Atualização de dados', manual: 'Manual', ff: 'Automática' },
                            { feature: 'Análise com IA', manual: '❌', ff: '✅' },
                            { feature: 'Dashboards interativos', manual: '❌', ff: '✅' },
                            { feature: 'Relatórios PDF', manual: 'Trabalhoso', ff: '1 clique' },
                            { feature: 'Segurança de dados', manual: 'Básica', ff: 'Criptografia' },
                            { feature: 'Suporte técnico', manual: '❌', ff: '24/7' },
                            { feature: 'Atualizações', manual: 'Manual', ff: 'Automáticas' }
                        ].map((row, index) => (
                            <div key={index} className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-white/10' : ''}`}>
                                <div className="text-white/90 text-sm">{row.feature}</div>
                                <div className="text-center text-white/60 text-sm">{row.manual}</div>
                                <div className="text-center text-emerald-400 text-sm font-medium">{row.ff}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-[#0f1d32]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Perguntas <span className="text-blue-400">Frequentes</span>
                        </h2>
                        <p className="text-white/60 text-lg">
                            Tire suas dúvidas sobre o FinanceFlow
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                question: 'Quais formatos de arquivo são suportados?',
                                answer: 'Suportamos arquivos Excel (.xlsx, .xls), CSV e integração direta com Google Sheets. Nosso sistema reconhece automaticamente a estrutura dos seus dados contábeis.'
                            },
                            {
                                question: 'Meus dados estão seguros?',
                                answer: 'Sim! Utilizamos criptografia de ponta a ponta (AES-256) e armazenamento em servidores com certificação ISO 27001. Seus dados nunca são compartilhados com terceiros.'
                            },
                            {
                                question: 'Posso cancelar a qualquer momento?',
                                answer: 'Absolutamente! Não há fidelidade ou multa por cancelamento. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel.'
                            },
                            {
                                question: 'Como funciona o período de teste?',
                                answer: 'Oferecemos 7 dias de teste gratuito com acesso completo a todos os recursos. Não é necessário cartão de crédito para começar.'
                            },
                            {
                                question: 'Vocês oferecem suporte técnico?',
                                answer: 'Sim! Oferecemos suporte por email com resposta em até 24 horas para todos os planos. Clientes enterprise têm acesso a suporte prioritário e onboarding dedicado.'
                            },
                            {
                                question: 'Posso exportar meus relatórios?',
                                answer: 'Sim! Você pode exportar todos os relatórios em PDF profissional, ideal para apresentações a stakeholders, investidores ou para arquivamento.'
                            }
                        ].map((faq, index) => (
                            <details
                                key={index}
                                className="group bg-[#162944] rounded-xl border border-white/10 hover:border-blue-500/30 transition-all"
                            >
                                <summary className="flex items-center justify-between p-6 cursor-pointer">
                                    <span className="text-white font-medium pr-4">{faq.question}</span>
                                    <span className="material-symbols-outlined text-blue-400 group-open:rotate-180 transition-transform">
                                        expand_more
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact/Newsletter Section */}
            <section id="contact" className="py-24 bg-[#0f1d32]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left - Contact Info */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Entre em <span className="text-blue-400">Contato</span>
                            </h2>
                            <p className="text-white/60 text-lg mb-8 leading-relaxed">
                                Tem alguma dúvida? Nossa equipe está pronta para ajudar.
                                Entre em contato e responderemos em até 24 horas.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-400">mail</span>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-sm">Email</div>
                                        <div className="text-white font-medium">contato@financeflow.com.br</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-emerald-400">support_agent</span>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-sm">Suporte</div>
                                        <div className="text-white font-medium">suporte@financeflow.com.br</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-400">schedule</span>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-sm">Horário de Atendimento</div>
                                        <div className="text-white font-medium">Seg - Sex, 9h às 18h</div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="text-white/40 text-sm mb-4">Siga-nos nas redes</div>
                                <div className="flex gap-3">
                                    {['LinkedIn', 'Twitter', 'Instagram', 'YouTube'].map((social, i) => (
                                        <a
                                            key={i}
                                            href="#"
                                            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <span className="text-xs font-bold">{social.charAt(0)}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right - Newsletter Form */}
                        <div className="bg-[#162944] rounded-2xl p-8 border border-white/10">
                            <h3 className="text-2xl font-bold text-white mb-2">Receba Novidades</h3>
                            <p className="text-white/50 mb-6">
                                Assine nossa newsletter e receba dicas de gestão financeira e atualizações do produto.
                            </p>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-white/60 text-sm mb-2">Nome</label>
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm mb-2">Mensagem (opcional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Sua mensagem..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-xl">send</span>
                                    Enviar Mensagem
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Pronto para Transformar sua
                        <span className="block mt-2">Gestão Financeira?</span>
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                        Junte-se a centenas de empresas que já otimizaram sua gestão contábil com o FinanceFlow
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 text-lg font-semibold px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
                        >
                            Começar Grátis por 7 Dias
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center bg-white/10 border border-white/30 text-white text-lg font-semibold px-10 py-4 rounded-xl hover:bg-white/20 transition-all"
                        >
                            Falar com Vendas
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">F</span>
                                </div>
                                <span className="text-xl font-bold">FinanceFlow</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                                Dashboard contábil inteligente que transforma seus dados em insights acionáveis.
                                Gestão financeira profissional ao alcance de um clique.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Produto</h3>
                            <ul className="space-y-3">
                                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Recursos</a></li>
                                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Preços</a></li>
                                <li><a href="#demo" className="text-slate-400 hover:text-white transition-colors">Demo</a></li>
                                <li><Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Empresa</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Sobre</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contato</a></li>
                                <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">Suporte</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-slate-500 text-sm">
                                © {new Date().getFullYear()} FinanceFlow. Todos os direitos reservados.
                            </p>
                            <div className="flex gap-6">
                                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Termos de Uso</a>
                                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Política de Privacidade</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Quick Signup Modal */}
            <QuickSignupModal
                isOpen={showSignupModal}
                onClose={() => setShowSignupModal(false)}
            />
        </div>
    );
};

export default Home;
