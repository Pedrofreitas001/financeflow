import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AIInsight {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: 'dre' | 'despesas' | 'cashflow' | 'balancete' | 'geral';
    date: string;
    tags: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'warning';
}

const DashboardAIInsights: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock data para insights
    const insights: AIInsight[] = [
        {
            id: '1',
            title: 'Oportunidade de Redução de Custos',
            summary: 'Detectamos um aumento de 23% nas despesas administrativas nos últimos 3 meses. Principais drivers: Serviços de TI (+45%) e Material de Escritório (+31%).',
            content: `# Análise Detalhada de Custos Administrativos

## 📊 Visão Geral
Identificamos uma tendência crescente nas despesas administrativas que merece atenção:

- **Variação Total:** +23% vs. trimestre anterior
- **Impacto Financeiro:** R$ 87.450 adicionais
- **Período Analisado:** Out-Dez 2025

## 🎯 Principais Achados

### 1. Serviços de TI (+45%)
- **Gasto Atual:** R$ 52.300/mês
- **Gasto Anterior:** R$ 36.000/mês
- **Causa:** Contratação de novos serviços cloud e licenças SaaS
- **Recomendação:** Revisar contratos e negociar planos corporativos

### 2. Material de Escritório (+31%)
- **Gasto Atual:** R$ 8.900/mês
- **Gasto Anterior:** R$ 6.800/mês
- **Causa:** Aumento de headcount em 15%
- **Recomendação:** Implementar política de compras centralizadas

## 💡 Ações Recomendadas

1. **Curto Prazo (30 dias)**
   - Auditar assinaturas SaaS duplicadas
   - Implementar aprovação prévia para compras >R$ 500

2. **Médio Prazo (90 dias)**
   - Negociar descontos por volume com fornecedores
   - Consolidar contratos de TI

3. **Longo Prazo (6 meses)**
   - Avaliar migração para soluções open-source
   - Implementar cultura de redução de custos

## 📈 Impacto Estimado
Seguindo essas recomendações, a economia projetada é de **R$ 15.000 - R$ 22.000 por mês**.`,
            category: 'despesas',
            date: '15/01/2026',
            tags: ['custos', 'eficiência', 'TI', 'administrativo'],
            sentiment: 'warning'
        },
        {
            id: '2',
            title: 'Performance Financeira Excepcional',
            summary: 'O EBITDA cresceu 34% no último trimestre, superando projeções em 12 pontos percentuais. Margem atingiu 28,5%, maior patamar em 2 anos.',
            content: `# Análise de Performance - Q4 2025

## 🎉 Destaques Positivos

### EBITDA Record
- **Valor:** R$ 1.245.000
- **Crescimento:** +34% vs. Q3
- **Margem:** 28,5% (vs. 21,3% anterior)

### Drivers de Performance
1. **Receita:** +18% organicamente
2. **Margem Bruta:** Melhoria de 3,2pp
3. **Eficiência Operacional:** Redução de 8% em despesas fixas

## 📊 Análise por Segmento

### Vendas
- Produto A: +45% em volume
- Produto B: +12% em ticket médio
- Novos clientes: 127 (meta: 100)

### Operações
- Produtividade: +23%
- Qualidade: 98,7% conformidade
- NPS: 82 pontos

## 🎯 Recomendações

Para manter essa trajetória:
1. Reinvestir 40% do lucro em Marketing
2. Expandir time comercial em 5 pessoas
3. Automatizar processos manuais remanescentes`,
            category: 'dre',
            date: '14/01/2026',
            tags: ['crescimento', 'ebitda', 'performance', 'receita'],
            sentiment: 'positive'
        },
        {
            id: '3',
            title: 'Alerta de Fluxo de Caixa',
            summary: 'Projeção indica possível déficit de caixa em Março/2026 se o padrão atual de recebimentos continuar. Necessário ação preventiva.',
            content: `# ⚠️ Alerta de Liquidez - Março 2026

## 🚨 Situação Crítica Identificada

### Projeção de Caixa
- **Saldo Atual:** R$ 340.000
- **Projeção Março:** R$ -85.000 (déficit)
- **Dias até criticidade:** 45 dias

## 📉 Causas Raiz

### 1. Prazo Médio de Recebimento
- **Atual:** 52 dias
- **Meta:** 30 dias
- **Impacto:** R$ 420.000 "travados"

### 2. Concentração de Pagamentos
- 68% das contas a pagar vencem em Março
- Folha + fornecedores: R$ 425.000

## 💊 Plano de Ação Imediato

### Semana 1-2
- [ ] Antecipar recebíveis via banco
- [ ] Renegociar top 5 clientes para prazo menor
- [ ] Pausar investimentos não-essenciais

### Semana 3-4
- [ ] Renegociar fornecedores para prazo 60 dias
- [ ] Avaliar linha de crédito emergencial
- [ ] Implementar controle diário de caixa

## 🎯 Metas de Recuperação
- Reduzir PMR para 35 dias até Abril
- Criar reserva de segurança de R$ 200.000`,
            category: 'cashflow',
            date: '13/01/2026',
            tags: ['urgente', 'cashflow', 'liquidez', 'recebimentos'],
            sentiment: 'negative'
        }
    ];

    const categories = [
        { id: 'todos', label: 'Todos', icon: 'apps' },
        { id: 'dre', label: 'DRE', icon: 'bar_chart' },
        { id: 'despesas', label: 'Despesas', icon: 'receipt_long' },
        { id: 'cashflow', label: 'Cash Flow', icon: 'trending_up' },
        { id: 'balancete', label: 'Balancete', icon: 'account_balance' },
        { id: 'geral', label: 'Geral', icon: 'insights' }
    ];

    const filteredInsights = selectedCategory === 'todos'
        ? insights
        : insights.filter(i => i.category === selectedCategory);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-500 bg-green-500/10';
            case 'negative': return 'text-red-500 bg-red-500/10';
            case 'warning': return 'text-amber-500 bg-amber-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'sentiment_satisfied';
            case 'negative': return 'sentiment_dissatisfied';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    const handleGenerateInsight = () => {
        setIsGenerating(true);
        // Simulação de geração (conectar com Gemini API depois)
        setTimeout(() => {
            setIsGenerating(false);
            alert('Insight sendo gerado! Isso é um placeholder - conectar com Gemini API');
        }, 2000);
    };

    return (
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? 'bg-background-dark' : 'bg-slate-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                💡 Insights de IA
                            </h1>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Análises inteligentes geradas pelo Gemini para otimizar suas finanças
                            </p>
                        </div>
                        <button
                            onClick={handleGenerateInsight}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Gerar Novo Insight
                                </>
                            )}
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : isDark
                                            ? 'bg-surface-dark text-gray-400 hover:bg-gray-800 hover:text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Insights Grid/Modal */}
                {!selectedInsight ? (
                    <div className="grid gap-6">
                        {filteredInsights.map(insight => (
                            <div
                                key={insight.id}
                                onClick={() => setSelectedInsight(insight)}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.01] ${isDark
                                        ? 'bg-surface-dark border-border-dark hover:border-blue-500/50'
                                        : 'bg-white border-gray-200 hover:border-blue-400'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${getSentimentColor(insight.sentiment)}`}>
                                            <span className="material-symbols-outlined text-2xl">
                                                {getSentimentIcon(insight.sentiment)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {insight.title}
                                            </h3>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {insight.date}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`material-symbols-outlined ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                        chevron_right
                                    </span>
                                </div>

                                <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {insight.summary}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {insight.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark
                                                    ? 'bg-blue-900/30 text-blue-300'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredInsights.length === 0 && (
                            <div className={`text-center py-16 rounded-2xl border ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'
                                }`}>
                                <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">
                                    psychology_alt
                                </span>
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Nenhum insight nesta categoria
                                </h3>
                                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Gere novos insights para visualizar análises aqui
                                </p>
                                <button
                                    onClick={handleGenerateInsight}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Gerar Primeiro Insight
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Insight Detail Modal */
                    <div className={`rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'
                        }`}>
                        {/* Header */}
                        <div className={`p-6 border-b ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
                            <button
                                onClick={() => setSelectedInsight(null)}
                                className={`flex items-center gap-2 mb-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Voltar aos Insights
                            </button>
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${getSentimentColor(selectedInsight.sentiment)}`}>
                                    <span className="material-symbols-outlined text-3xl">
                                        {getSentimentIcon(selectedInsight.sentiment)}
                                    </span>
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedInsight.title}
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Gerado em {selectedInsight.date}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedInsight.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
                                {selectedInsight.content.split('\n').map((line, idx) => {
                                    if (line.startsWith('# ')) {
                                        return <h1 key={idx} className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{line.slice(2)}</h1>;
                                    } else if (line.startsWith('## ')) {
                                        return <h2 key={idx} className={`text-2xl font-bold mt-8 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{line.slice(3)}</h2>;
                                    } else if (line.startsWith('### ')) {
                                        return <h3 key={idx} className={`text-xl font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{line.slice(4)}</h3>;
                                    } else if (line.startsWith('- ')) {
                                        return <li key={idx} className={`ml-6 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{line.slice(2)}</li>;
                                    } else if (line.trim() === '') {
                                        return <br key={idx} />;
                                    } else {
                                        return <p key={idx} className={`mb-3 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{line}</p>;
                                    }
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={`p-6 border-t flex gap-3 ${isDark ? 'border-border-dark bg-background-dark' : 'border-gray-200 bg-gray-50'}`}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                                <span className="material-symbols-outlined">picture_as_pdf</span>
                                Exportar PDF
                            </button>
                            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isDark
                                    ? 'bg-surface-dark hover:bg-gray-800 text-white border border-border-dark'
                                    : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
                                }`}>
                                <span className="material-symbols-outlined">share</span>
                                Compartilhar
                            </button>
                            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isDark
                                    ? 'bg-surface-dark hover:bg-gray-800 text-white border border-border-dark'
                                    : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
                                }`}>
                                <span className="material-symbols-outlined">bookmark</span>
                                Salvar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default DashboardAIInsights;
