import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Download, Upload, CheckCircle, AlertCircle, FileSpreadsheet, ChevronDown, ChevronUp, Sparkles, Brain, TrendingUp } from 'lucide-react';
import LoggedNavbar from '../components/LoggedNavbar';
import { validateWithGemini } from '../../utils/geminiValidation';
import { analyzeFileStructure } from '../../utils/dataValidation';
import * as XLSX from 'xlsx';

interface ValidationResult {
    status: 'ok' | 'adjustment_needed';
    summary: string;
    checks: Array<{
        field: string;
        issue: string;
        message: string;
    }>;
    ready_pages: string[];
    blocked_pages: string[];
    current_capabilities?: string[]; // O que já pode ser visualizado
    missing_for_full?: string[]; // O que falta para funcionalidade completa
}

interface DashboardTab {
    id: string;
    name: string;
    description: string;
    requiredColumns: Array<{
        name: string;
        type: string;
        example: string;
    }>;
    optionalColumns: Array<{
        name: string;
        type: string;
    }>;
}

const DataPreparation: React.FC = () => {
    const { user } = useAuth();
    const [expandedTab, setExpandedTab] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedPages, setSelectedPages] = useState<string[]>([]);

    const dashboardTabs: DashboardTab[] = [
        {
            id: 'visao_geral',
            name: 'Visão Geral',
            description: 'Total de valores e evolução ao longo do tempo',
            requiredColumns: [
                { name: 'Data', type: 'Data', example: '12/01/2025' },
                { name: 'Valor', type: 'Número', example: '1500.75' }
            ],
            optionalColumns: [
                { name: 'Categoria', type: 'Texto' },
                { name: 'Região', type: 'Texto' }
            ]
        },
        {
            id: 'despesas',
            name: 'Despesas',
            description: 'Análise detalhada por categorias de receitas e despesas',
            requiredColumns: [
                { name: 'Categoria', type: 'Texto', example: 'Vendas' },
                { name: 'Valor', type: 'Número', example: '2500.00' }
            ],
            optionalColumns: [
                { name: 'Data', type: 'Data' },
                { name: 'Subcategoria', type: 'Texto' }
            ]
        },
        {
            id: 'dre',
            name: 'DRE',
            description: 'Demonstrativo de Resultados do Exercício',
            requiredColumns: [
                { name: 'Período', type: 'Data', example: '01/2025' },
                { name: 'Conta', type: 'Texto', example: 'Receita de Vendas' },
                { name: 'Valor', type: 'Número', example: '15000.00' }
            ],
            optionalColumns: [
                { name: 'Centro de Custo', type: 'Texto' },
                { name: 'Natureza', type: 'Texto' }
            ]
        },
        {
            id: 'fluxo_caixa',
            name: 'Fluxo de Caixa',
            description: 'Entradas e saídas de recursos financeiros',
            requiredColumns: [
                { name: 'Data', type: 'Data', example: '15/01/2025' },
                { name: 'Tipo', type: 'Texto', example: 'Entrada' },
                { name: 'Valor', type: 'Número', example: '3500.00' }
            ],
            optionalColumns: [
                { name: 'Descrição', type: 'Texto' },
                { name: 'Forma de Pagamento', type: 'Texto' }
            ]
        },
        {
            id: 'balancete',
            name: 'Balancete',
            description: 'Posição patrimonial e contábil da empresa',
            requiredColumns: [
                { name: 'Conta', type: 'Texto', example: 'Caixa' },
                { name: 'Saldo Devedor', type: 'Número', example: '5000.00' },
                { name: 'Saldo Credor', type: 'Número', example: '0.00' }
            ],
            optionalColumns: [
                { name: 'Código', type: 'Texto' },
                { name: 'Grupo', type: 'Texto' }
            ]
        }
    ];

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            setValidationResult(null);
        }
    };

    const handleValidation = async () => {
        if (!uploadedFile) return;

        setIsValidating(true);

        try {
            console.log('Iniciando validação do arquivo:', uploadedFile.name);

            // Ler o arquivo Excel
            const arrayBuffer = await uploadedFile.arrayBuffer();
            console.log('Arquivo lido, tamanho:', arrayBuffer.byteLength);

            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            console.log('Workbook criado, abas:', workbook.SheetNames);

            // Pegar a primeira aba
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Converter para JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            console.log('Dados convertidos:', jsonData.length, 'linhas');

            if (!jsonData || jsonData.length === 0) {
                setValidationResult({
                    status: 'adjustment_needed',
                    summary: 'O arquivo está vazio ou não possui dados válidos.',
                    checks: [{
                        field: 'arquivo',
                        issue: 'empty_values',
                        message: 'Não foi possível detectar dados no arquivo. Certifique-se de que há dados na primeira aba.'
                    }],
                    ready_pages: [],
                    blocked_pages: selectedPages
                });
                setIsValidating(false);
                return;
            }

            // Analisar estrutura do arquivo
            const detectedColumns = analyzeFileStructure(jsonData);

            // Preparar dados para validação
            const uploadedData = {
                columns: detectedColumns,
                row_count: jsonData.length,
                file_name: uploadedFile.name,
                sheets: workbook.SheetNames
            };

            // Mapear IDs técnicos para nomes amigáveis
            const pageNameMap: { [key: string]: string } = {
                'visao_geral': 'Visão Geral',
                'por_categoria': 'Despesas',
                'dre': 'DRE',
                'fluxo_caixa': 'Fluxo de Caixa',
                'balancete': 'Balancete'
            };

            // Validar com Gemini AI
            const result = await validateWithGemini(uploadedData, selectedPages);

            // Traduzir nomes das páginas na resposta
            if (result.ready_pages) {
                result.ready_pages = result.ready_pages.map(id => pageNameMap[id] || id);
            }
            if (result.blocked_pages) {
                result.blocked_pages = result.blocked_pages.map(id => pageNameMap[id] || id);
            }

            setValidationResult(result);
        } catch (error) {
            console.error('Erro ao validar arquivo:', error);

            // Mensagem de erro mais detalhada
            let errorMessage = 'Erro ao validar o arquivo. Verifique se é um arquivo Excel válido.';
            if (error instanceof Error) {
                console.error('Detalhes do erro:', error.message);
                errorMessage = error.message;
            }

            setValidationResult({
                status: 'adjustment_needed',
                summary: errorMessage,
                checks: [{
                    field: 'erro',
                    issue: 'invalid_format',
                    message: error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo'
                }],
                ready_pages: [],
                blocked_pages: selectedPages
            });
        } finally {
            setIsValidating(false);
        }
    };

    const downloadTemplate = (templateType: string) => {
        console.log('Downloading template:', templateType);
        alert('Download do modelo será implementado em breve');
    };

    return (
        <div className="min-h-screen bg-white">
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

                            <div className="hidden md:flex items-center gap-6">
                                <Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Home</Link>
                                <a href="/#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Recursos</a>
                                <Link to="/preparar-dados" className="text-sm font-medium text-white">Preparar Dados</Link>
                                <a href="/#how-it-works" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Como Funciona</a>
                                <a href="/#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Preços</a>
                                <a href="/#faq" className="text-sm font-medium text-white/80 hover:text-white transition-colors">FAQ</a>
                            </div>

                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Login</Link>
                                <Link to="/dashboard" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-all">Acessar Dashboard</Link>
                            </div>

                            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <span className="material-symbols-outlined text-white">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-[#0f1d32] border-t border-white/10">
                            <div className="px-6 py-4 space-y-3">
                                <Link to="/" className="block py-2 text-white/80 font-medium">Home</Link>
                                <a href="/#features" className="block py-2 text-white/80 font-medium">Recursos</a>
                                <Link to="/preparar-dados" className="block py-2 text-white font-medium">Preparar Dados</Link>
                                <a href="/#how-it-works" className="block py-2 text-white/80 font-medium">Como Funciona</a>
                                <a href="/#pricing" className="block py-2 text-white/80 font-medium">Preços</a>
                                <a href="/#faq" className="block py-2 text-white/80 font-medium">FAQ</a>
                                <Link to="/login" className="block py-2 text-white/80 font-medium">Login</Link>
                                <Link to="/dashboard" className="block py-3 px-6 bg-blue-600 text-white text-center font-semibold rounded-lg">Acessar Dashboard</Link>
                            </div>
                        </div>
                    )}
                </nav>
            )}

            {/* Hero Section */}
            <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-20">
                <div className="absolute inset-0 bg-[#142038]"></div>
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(110deg, rgba(15, 30, 55, 0.6) 0%, rgba(22, 37, 68, 0.3) 40%, rgba(30, 58, 95, 0.25) 70%, rgba(37, 78, 130, 0.2) 100%)'
                }}></div>
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 42% 22%, rgba(56, 182, 255, 0.16) 0%, rgba(80, 200, 255, 0.08) 20%, transparent 42%)'
                }}></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}></div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#1a2d4a] border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <span className="text-white/90 text-sm font-medium">Validação com IA em tempo real</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Prepare seus dados <br />
                                <span className="text-blue-400">em minutos</span>
                            </h1>

                            <p className="text-white/70 text-lg lg:text-xl leading-relaxed mb-10">
                                Use nossos modelos prontos ou valide seu próprio Excel antes de importar.
                                Nossa IA garante que tudo esteja correto.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => downloadTemplate('completo')}
                                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-blue-500 transition-all"
                                >
                                    <Download size={20} />
                                    Baixar Modelos
                                </button>
                                <button
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-white/15 transition-all"
                                >
                                    <Upload size={20} />
                                    Validar Meu Excel
                                </button>
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="relative">
                            <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Brain className="w-8 h-8 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-semibold">Validação Inteligente</h3>
                                        <p className="text-white/60 text-sm">Powered by Google Gemini AI</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span className="text-white/90 text-sm">Datas validadas ✓</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span className="text-white/90 text-sm">Colunas obrigatórias presentes ✓</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        <span className="text-white/90 text-sm">Poucos registros (adicione mais)</span>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                        <span className="text-white font-medium text-sm">Pronto para importar</span>
                                    </div>
                                    <p className="text-white/70 text-xs">3 de 5 abas prontas para gerar dashboard</p>
                                </div>
                            </div>

                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Como funciona - Seção Branca */}
            <section className="py-24 bg-slate-50">
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

            {/* Abas do Dashboard - Seção Azul Escuro */}
            <section className="py-20 px-6 bg-[#0f1d32]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Dados necessários para cada aba
                        </h2>
                        <p className="text-white/70 text-lg max-w-2xl mx-auto">
                            Veja exatamente quais colunas você precisa para cada seção do dashboard
                        </p>
                    </div>

                    <div className="space-y-4">
                        {dashboardTabs.map((tab) => (
                            <div
                                key={tab.id}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all"
                            >
                                <button
                                    onClick={() => setExpandedTab(expandedTab === tab.id ? null : tab.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                                            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-xl font-semibold text-white mb-1">
                                                {tab.name}
                                            </h3>
                                            <p className="text-white/60 text-sm">{tab.description}</p>
                                        </div>
                                    </div>
                                    {expandedTab === tab.id ? (
                                        <ChevronUp className="text-white" size={24} />
                                    ) : (
                                        <ChevronDown className="text-white" size={24} />
                                    )}
                                </button>

                                {expandedTab === tab.id && (
                                    <div className="px-6 pb-6 pt-2">
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wide">
                                                Colunas obrigatórias
                                            </h4>
                                            <div className="bg-[#1a2d4a]/50 border border-white/10 rounded-xl overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-white/10">
                                                            <th className="py-2 px-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider bg-white/5 whitespace-nowrap">
                                                                Coluna
                                                            </th>
                                                            <th className="py-2 px-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider bg-white/5 whitespace-nowrap">
                                                                Tipo
                                                            </th>
                                                            <th className="py-2 px-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider bg-white/5 whitespace-nowrap">
                                                                Exemplo
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {tab.requiredColumns.map((col, idx) => (
                                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                                <td className="py-2 px-3 text-white font-medium text-xs whitespace-nowrap">{col.name}</td>
                                                                <td className="py-2 px-3">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                                                                        {col.type}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2 px-3 text-blue-400 font-mono text-xs whitespace-nowrap">{col.example}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {tab.optionalColumns.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wide">
                                                    Colunas opcionais
                                                </h4>
                                                <div className="bg-[#1a2d4a]/30 border border-white/10 rounded-xl overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-white/10">
                                                                <th className="py-2 px-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider bg-white/5 whitespace-nowrap">
                                                                    Coluna
                                                                </th>
                                                                <th className="py-2 px-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider bg-white/5 whitespace-nowrap">
                                                                    Tipo
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {tab.optionalColumns.map((col, idx) => (
                                                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                                    <td className="py-2 px-3 text-white/80 text-xs whitespace-nowrap">{col.name}</td>
                                                                    <td className="py-2 px-3">
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30 whitespace-nowrap">
                                                                            {col.type}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => downloadTemplate(tab.id)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-medium"
                                        >
                                            <Download size={18} />
                                            Baixar modelo dessa aba
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modelos de Excel - Seção Branca */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Modelos prontos para download
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Todos os modelos incluem exemplos preenchidos e comentários explicativos
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Modelo Completo</h3>
                            <p className="text-gray-600 mb-6">
                                Todas as abas do dashboard em um único arquivo com exemplos preenchidos e comentários
                            </p>
                            <button
                                onClick={() => downloadTemplate('completo')}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                            >
                                <Download size={18} />
                                Baixar Completo
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Por Aba</h3>
                            <p className="text-gray-600 mb-6">
                                Escolha e baixe apenas as abas específicas que você precisa para seu dashboard
                            </p>
                            <button
                                onClick={() => downloadTemplate('por_aba')}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium"
                            >
                                <Download size={18} />
                                Escolher Abas
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Modelo Mínimo</h3>
                            <p className="text-gray-600 mb-6">
                                Apenas visão geral com o essencial para começar rapidamente seu primeiro dashboard
                            </p>
                            <button
                                onClick={() => downloadTemplate('minimo')}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium"
                            >
                                <Download size={18} />
                                Baixar Mínimo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Validação com IA - Seção Azul Escuro */}
            <section className="py-20 px-6 bg-[#0f1d32]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                            <Brain className="w-5 h-5 text-blue-400" />
                            <span className="text-white/90 text-sm font-medium">Powered by Google Gemini AI</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Validação automática com IA
                        </h2>
                        <p className="text-white/70 text-lg max-w-2xl mx-auto">
                            Antes de importar, nossa IA analisa seu Excel e informa objetivamente o que precisa ser ajustado
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12">
                        {selectedPages.length === 0 ? (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <FileSpreadsheet size={40} className="text-white/70" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-3">
                                    Selecione as páginas do dashboard
                                </h3>
                                <p className="text-white/70 mb-8 max-w-md mx-auto">
                                    Escolha quais abas do dashboard você quer que a IA valide no seu arquivo
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                                    {dashboardTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                if (selectedPages.includes(tab.id)) {
                                                    setSelectedPages(selectedPages.filter(p => p !== tab.id));
                                                } else {
                                                    setSelectedPages([...selectedPages, tab.id]);
                                                }
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${selectedPages.includes(tab.id)
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                                                }`}
                                        >
                                            <FileSpreadsheet size={20} className="mb-2" />
                                            <div className="font-semibold text-sm">{tab.name}</div>
                                        </button>
                                    ))}
                                </div>
                                {selectedPages.length > 0 && (
                                    <div className="mt-6">
                                        <p className="text-white/60 text-sm mb-4">
                                            {selectedPages.length} página{selectedPages.length > 1 ? 's' : ''} selecionada{selectedPages.length > 1 ? 's' : ''}
                                        </p>
                                        <button
                                            onClick={() => document.getElementById('file-upload-2')?.click()}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium text-lg"
                                        >
                                            <Upload size={20} />
                                            Continuar para Upload
                                        </button>
                                        <input
                                            id="file-upload-2"
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : !uploadedFile ? (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Upload size={40} className="text-white/70" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-3">
                                    Faça upload do seu arquivo
                                </h3>
                                <p className="text-white/70 mb-6 max-w-md mx-auto">
                                    Arraste e solte ou clique para selecionar seu arquivo Excel
                                </p>
                                <div className="mb-6">
                                    <p className="text-white/80 text-sm mb-2">Páginas selecionadas para validação:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {selectedPages.map(pageId => {
                                            const tab = dashboardTabs.find(t => t.id === pageId);
                                            return (
                                                <span key={pageId} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-xs">
                                                    {tab?.name}
                                                    <button
                                                        onClick={() => setSelectedPages(selectedPages.filter(p => p !== pageId))}
                                                        className="hover:text-red-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => document.getElementById('file-upload-2')?.click()}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium text-lg"
                                >
                                    <Upload size={20} />
                                    Selecionar arquivo
                                </button>
                                <button
                                    onClick={() => setSelectedPages([])}
                                    className="block mx-auto mt-4 text-white/60 hover:text-white text-sm transition-colors"
                                >
                                    ← Voltar e mudar páginas
                                </button>
                                <input
                                    id="file-upload-2"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-6 p-4 bg-white/10 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet size={32} className="text-blue-400" />
                                        <div>
                                            <p className="text-white font-semibold">{uploadedFile.name}</p>
                                            <p className="text-white/60 text-sm">
                                                {(uploadedFile.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setUploadedFile(null);
                                            setValidationResult(null);
                                        }}
                                        className="text-white/70 hover:text-white transition-colors px-4 py-2"
                                    >
                                        Remover
                                    </button>
                                </div>

                                {!validationResult && (
                                    <button
                                        onClick={handleValidation}
                                        disabled={isValidating}
                                        className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 font-medium text-lg"
                                    >
                                        {isValidating ? 'Validando com IA...' : 'Validar arquivo'}
                                    </button>
                                )}

                                {validationResult && (
                                    <div className="mt-6 space-y-4">
                                        {/* Resumo Principal - Style Hero */}
                                        <div className={`relative p-6 rounded-2xl border backdrop-blur-sm ${validationResult.status === 'ok'
                                            ? 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30'
                                            : 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30'
                                            }`}>
                                            <h3 className={`text-lg font-semibold mb-2 ${validationResult.status === 'ok' ? 'text-emerald-100' : 'text-blue-100'}`}>
                                                {validationResult.summary}
                                            </h3>
                                        </div>

                                        {/* Grid de 2 colunas - Style Hero Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* O que você PODE visualizar */}
                                            {validationResult.current_capabilities && validationResult.current_capabilities.length > 0 && (
                                                <div className="relative bg-gradient-to-br from-emerald-600/15 to-teal-600/15 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                        <h4 className="text-emerald-100 font-semibold text-sm">O que você pode visualizar</h4>
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {validationResult.current_capabilities.map((cap, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-emerald-50 text-xs p-2.5 bg-emerald-500/25 rounded-lg border border-emerald-500/20">
                                                                <span className="text-emerald-300 mt-0.5">✓</span>
                                                                <span>{cap}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Funcionalidades OPCIONAIS */}
                                            {validationResult.missing_for_full && validationResult.missing_for_full.length > 0 && (
                                                <div className="relative bg-gradient-to-br from-blue-600/15 to-cyan-600/15 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                                        <h4 className="text-blue-100 font-semibold text-sm">Funcionalidades opcionais</h4>
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {validationResult.missing_for_full.map((missing, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-blue-50 text-xs p-2.5 bg-blue-500/25 rounded-lg border border-blue-500/20">
                                                                <span className="text-blue-300 mt-0.5">+</span>
                                                                <span>{missing}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* O que FALTA - Style Hero Alert */}
                                        {validationResult.checks && validationResult.checks.length > 0 && (
                                            <div className="relative bg-gradient-to-br from-rose-600/15 to-orange-600/15 backdrop-blur-sm border border-rose-500/30 rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AlertCircle className="w-5 h-5 text-rose-400" />
                                                    <h4 className="text-rose-100 font-semibold text-sm">O que está faltando</h4>
                                                </div>
                                                <ul className="space-y-2">
                                                    {validationResult.checks.map((check, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-xs p-3 bg-rose-500/25 rounded-lg border border-rose-500/20">
                                                            <span className="text-rose-300 mt-0.5 font-bold">✗</span>
                                                            <div>
                                                                <p className="text-rose-50 font-medium">{check.field}</p>
                                                                <p className="text-rose-100/80 text-xs mt-0.5">{check.message}</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Status das Abas em Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {validationResult.ready_pages.length > 0 && (
                                                <div className="relative bg-gradient-to-br from-emerald-600/15 to-teal-600/15 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                        <h4 className="text-emerald-100 font-semibold text-xs">Abas prontas</h4>
                                                    </div>
                                                    <p className="text-emerald-50/90 text-xs">{validationResult.ready_pages.join(', ')}</p>
                                                </div>
                                            )}

                                            {validationResult.blocked_pages.length > 0 && (
                                                <div className="relative bg-gradient-to-br from-rose-600/15 to-orange-600/15 backdrop-blur-sm border border-rose-500/30 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertCircle className="w-4 h-4 text-rose-400" />
                                                        <h4 className="text-rose-100 font-semibold text-xs">Abas precisam ajustes</h4>
                                                    </div>
                                                    <p className="text-rose-50/90 text-xs">{validationResult.blocked_pages.join(', ')}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botão OK - Style Hero */}
                                        <button
                                            onClick={() => setValidationResult(null)}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-semibold text-sm font-medium"
                                        >
                                            OK, Entendi ✓
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ - Seção Branca */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Perguntas Frequentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Posso usar meu próprio Excel?",
                                a: "Sim! Você pode usar seu próprio arquivo Excel. Nosso sistema validará se os dados estão no formato adequado e indicará os ajustes necessários, caso haja."
                            },
                            {
                                q: "Precisa seguir o nome exato das colunas?",
                                a: "Não necessariamente. Nossa IA consegue identificar colunas similares (por exemplo, \"Data\", \"Date\", \"Data Venda\" são reconhecidas). O importante é que o tipo de dado esteja correto."
                            },
                            {
                                q: "A IA altera meus dados?",
                                a: "Não! A IA apenas valida e informa se há problemas. Ela nunca altera ou corrige automaticamente seus dados. Você tem total controle sobre qualquer modificação."
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {faq.q}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final - Seção Azul Escuro */}
            <section className="py-20 px-6 bg-[#0f1d32]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Pronto para começar?
                    </h2>
                    <p className="text-xl text-white/70 mb-10">
                        Baixe os modelos ou valide seu arquivo agora mesmo
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => downloadTemplate('completo')}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium text-lg"
                        >
                            <Download size={20} />
                            Baixar modelos
                        </button>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-medium text-lg"
                        >
                            Criar conta grátis
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-8 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center text-gray-600">
                    <p>© 2026 FinanceFlow. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default DataPreparation;
