import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ContaBalancete } from '../../context/BalanceteContext';

interface SnapshotExecutivoProps {
    dados: ContaBalancete[];
    empresas: string[];
    totais: {
        ativo: number;
        passivo: number;
        pl: number;
        ativoCirculante: number;
        ativoNaoCirculante: number;
        passivoCirculante: number;
        passivoNaoCirculante: number;
    };
}

interface InsightItem {
    tipo: 'info' | 'alerta' | 'oportunidade';
    titulo: string;
    descricao: string;
    icone: string;
}

const SnapshotExecutivo: React.FC<SnapshotExecutivoProps> = ({ dados, empresas, totais }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [expandido, setExpandido] = useState<boolean>(false);

    // Dados já vêm filtrados do contexto
    const dadosFiltrados = dados;

    // Calcular indicadores
    const liquidezGeral = totais.ativoCirculante > 0
        ? totais.passivoCirculante / totais.ativoCirculante
        : 0;

    const endividamento = totais.ativo > 0
        ? (totais.passivo / totais.ativo) * 100
        : 0;

    const autonomia = totais.ativo > 0
        ? (totais.pl / totais.ativo) * 100
        : 0;

    const concentracaoAtivoLC = totais.ativo > 0
        ? (totais.ativoNaoCirculante / totais.ativo) * 100
        : 0;

    const caixaEquivalentes = dadosFiltrados
        .filter(d =>
            d.nomeContaContabil.toLowerCase().includes('caixa') ||
            d.nomeContaContabil.toLowerCase().includes('banco') ||
            d.nomeContaContabil.toLowerCase().includes('aplicação')
        )
        .reduce((acc, d) => acc + Math.abs(d.saldo), 0);

    const caixaPercentualAC = totais.ativoCirculante > 0
        ? (caixaEquivalentes / totais.ativoCirculante) * 100
        : 0;

    // Gerar insights dinamicamente
    const gerarInsights = (): InsightItem[] => {
        const insights: InsightItem[] = [];

        // Insight 1: Estrutura de Ativo
        if (concentracaoAtivoLC > 60) {
            insights.push({
                tipo: 'alerta',
                titulo: 'Ativo Concentrado no Longo Prazo',
                descricao: `${concentracaoAtivoLC.toFixed(0)}% do ativo está alocado no longo prazo. A empresa tem menor liquidez imediata e pode enfrentar restrições para cobrir obrigações de curto prazo com caixa disponível.`,
                icone: '⚠️',
            });
        } else if (concentracaoAtivoLC > 40) {
            insights.push({
                tipo: 'info',
                titulo: 'Equilíbrio Ativo de Curto e Longo Prazo',
                descricao: `A empresa mantém ${concentracaoAtivoLC.toFixed(0)}% do ativo no longo prazo, equilibrando liquidez e investimentos estruturais.`,
                icone: '✓',
            });
        } else {
            insights.push({
                tipo: 'oportunidade',
                titulo: 'Forte Orientação para Curto Prazo',
                descricao: `Apenas ${concentracaoAtivoLC.toFixed(0)}% do ativo está no longo prazo. Considere aumentar investimentos em imobilizado ou ativo não circulante para crescimento sustentável.`,
                icone: '💡',
            });
        }

        // Insight 2: Estrutura de Financiamento
        insights.push({
            tipo: 'info',
            titulo: 'Estrutura de Financiamento',
            descricao: `${autonomia.toFixed(0)}% da estrutura patrimonial é financiada por capital próprio (PL). A empresa tem ${endividamento.toFixed(0)}% de recursos de terceiros, indicando ${endividamento < 50 ? 'baixo risco financeiro' : 'endividamento moderado a elevado'}.`,
            icone: '📊',
        });

        // Insight 3: Liquidez Corrente
        if (liquidezGeral > 1.5) {
            insights.push({
                tipo: 'oportunidade',
                titulo: 'Forte Posição de Liquidez',
                descricao: `Liquidez geral de ${liquidezGeral.toFixed(2)}. A empresa tem capacidade para cobrir ${liquidezGeral.toFixed(1)}x o passivo circulante com ativos circulantes. Há oportunidade para otimizar o uso desses recursos.`,
                icone: '💰',
            });
        } else if (liquidezGeral > 1) {
            insights.push({
                tipo: 'info',
                titulo: 'Liquidez Adequada',
                descricao: `Liquidez geral de ${liquidezGeral.toFixed(2)}. A empresa mantém cobertura confortável das obrigações de curto prazo.`,
                icone: '✓',
            });
        } else {
            insights.push({
                tipo: 'alerta',
                titulo: 'Pressão de Liquidez',
                descricao: `Liquidez geral de apenas ${liquidezGeral.toFixed(2)}. A empresa pode enfrentar dificuldades para cobrir obrigações de curto prazo. Recomenda-se revisar fluxo de caixa.`,
                icone: '⚠️',
            });
        }

        // Insight 4: Composição Caixa
        if (caixaPercentualAC > 30) {
            insights.push({
                tipo: 'info',
                titulo: 'Caixa Relevante em Circulante',
                descricao: `Caixa e equivalentes representam ${caixaPercentualAC.toFixed(0)}% do ativo circulante. A empresa mantém parcela significativa de recursos imediatamente disponíveis.`,
                icone: '✓',
            });
        } else if (caixaPercentualAC > 10) {
            insights.push({
                tipo: 'info',
                titulo: 'Caixa Moderado',
                descricao: `${caixaPercentualAC.toFixed(0)}% do ativo circulante está em caixa. Recursos estão distribuídos entre contas a receber e estoques.`,
                icone: '📈',
            });
        } else {
            insights.push({
                tipo: 'alerta',
                titulo: 'Baixa Concentração de Caixa',
                descricao: `Apenas ${caixaPercentualAC.toFixed(0)}% do ativo circulante está em caixa. A empresa depende principalmente de recebimentos e conversão de estoques.`,
                icone: '⚠️',
            });
        }

        // Insight 5: Obrigações de Curto Prazo
        const passivoCircularPercentual = totais.passivo > 0
            ? (totais.passivoCirculante / totais.passivo) * 100
            : 0;

        insights.push({
            tipo: 'info',
            titulo: 'Vencimento de Obrigações',
            descricao: `${passivoCircularPercentual.toFixed(0)}% do passivo vence no curto prazo. ${passivoCircularPercentual > 70 ? 'Alta concentração de obrigações vencíveis, demandando gestão ativa de caixa.' : 'Distribuição equilibrada entre obrigações de curto e longo prazo.'}`,
            icone: '📅',
        });

        return insights;
    };

    const insights = gerarInsights();

    const typeStyles = {
        info: {
            bg: isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200',
            icone: 'text-blue-500',
            titulo: isDark ? 'text-blue-300' : 'text-blue-700',
            desc: isDark ? 'text-blue-200/80' : 'text-blue-600',
        },
        alerta: {
            bg: isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200',
            icone: 'text-amber-500',
            titulo: isDark ? 'text-amber-300' : 'text-amber-700',
            desc: isDark ? 'text-amber-200/80' : 'text-amber-600',
        },
        oportunidade: {
            bg: isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200',
            icone: 'text-emerald-500',
            titulo: isDark ? 'text-emerald-300' : 'text-emerald-700',
            desc: isDark ? 'text-emerald-200/80' : 'text-emerald-600',
        },
    };

    return (
        <div className={`${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-300'} rounded-2xl border shadow-lg overflow-hidden`}>
            {/* Header Colapsível */}
            <button
                onClick={() => setExpandido(!expandido)}
                className={`w-full p-6 flex items-center justify-between transition-colors ${expandido ? (isDark ? 'bg-surface-dark' : 'bg-white') : (isDark ? 'hover:bg-background-dark' : 'hover:bg-gray-50')}`}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className={`text-2xl flex-shrink-0 ${expandido ? 'text-primary' : 'text-gray-400'}`}>
                        📊
                    </div>
                    <div className="text-left">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Snapshot Executivo
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
                            {expandido ? 'Clique para fechar' : 'Interpretação dinâmica da posição patrimonial — clique para expandir'}
                        </p>
                    </div>
                </div>

                <div className={`text-2xl transition-transform duration-300 flex-shrink-0 ${expandido ? 'rotate-180' : ''}`}>
                    ▼
                </div>
            </button>

            {/* Conteúdo Expandível */}
            {expandido && (
                <div className={`border-t ${isDark ? 'border-border-dark' : 'border-gray-200'} p-6`}>
                    {/* Grid de Insights */}
                    <div className="space-y-3">
                        {insights.map((insight, idx) => {
                            const style = typeStyles[insight.tipo];
                            return (
                                <div
                                    key={idx}
                                    className={`rounded-lg border p-4 transition-all hover:shadow-md ${style.bg}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`text-xl flex-shrink-0 ${style.icone}`}>
                                            {insight.icone}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-xs font-bold ${style.titulo} mb-1`}>
                                                {insight.titulo}
                                            </h4>
                                            <p className={`text-xs leading-relaxed ${style.desc}`}>
                                                {insight.descricao}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Dica de Interpretação */}
                    <div className={`mt-4 p-3 rounded-lg text-xs ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-semibold">💡 Nota:</span> Os insights acima traduzem a contabilidade em linguagem executiva e devem ser complementados pela análise detalhada dos dados na tabela de balancete.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SnapshotExecutivo;
