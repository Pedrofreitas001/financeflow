/**
 * Exemplo de Integração da IA de Análise no Dashboard
 * 
 * Este arquivo mostra como integrar o sistema de análise com IA
 * em qualquer componente do dashboard.
 */

import React, { useState } from 'react';
import { analyzeDashboardData, type DashboardData, type AnalysisResult } from '@/utils/dashboardAIAnalysis';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader } from 'lucide-react';

/**
 * Componente de Análise com IA
 * Pode ser usado em qualquer página do dashboard
 */
export const AIAnalysisPanel: React.FC<{
    dashboardType: 'visao_geral' | 'despesas' | 'dre' | 'fluxo_caixa' | 'balancete' | 'indicadores' | 'orcamento';
    data: any;
    period: string;
    companyName?: string;
    industry?: string;
}> = ({ dashboardType, data, period, companyName, industry }) => {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const dashboardData: DashboardData = {
                type: dashboardType,
                period,
                data,
                context: {
                    companyName,
                    industry
                }
            };

            const result = await analyzeDashboardData(dashboardData);
            setAnalysis(result);
            setIsExpanded(true);
        } catch (err) {
            setError('Erro ao gerar análise. Tente novamente.');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Análise com IA</h3>
                            <p className="text-sm text-gray-500">Powered by Google Gemini</p>
                        </div>
                    </div>

                    {!analysis && (
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4" />
                                    Analisar Dados
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 border-b border-red-100">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="p-6 space-y-6">
                    {/* Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Resumo Executivo</h4>
                        <p className="text-blue-800 text-sm leading-relaxed">{analysis.summary}</p>
                        {analysis.confidence && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                                    <span>Confiança da Análise</span>
                                    <span>{Math.round(analysis.confidence * 100)}%</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${analysis.confidence * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Insights */}
                    {analysis.insights.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-gray-900">Principais Insights</h4>
                            </div>
                            <ul className="space-y-2">
                                {analysis.insights.map((insight, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        <span className="text-green-600 mt-0.5">●</span>
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Trends */}
                    {analysis.trends.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-gray-900">Tendências</h4>
                            </div>
                            <ul className="space-y-2">
                                {analysis.trends.map((trend, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                        <span className="text-blue-600 mt-0.5">↗</span>
                                        <span>{trend}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Alerts */}
                    {analysis.alerts.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                <h4 className="font-semibold text-gray-900">Alertas</h4>
                            </div>
                            <ul className="space-y-2">
                                {analysis.alerts.map((alert, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                        <span className="text-yellow-600 mt-0.5">⚠</span>
                                        <span>{alert}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-purple-600" />
                                <h4 className="font-semibold text-gray-900">Recomendações</h4>
                            </div>
                            <ul className="space-y-2">
                                {analysis.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                                        <span className="text-purple-600 mt-0.5">💡</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleAnalyze}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                        >
                            Atualizar Análise
                        </button>
                        <button
                            onClick={() => setAnalysis(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all text-sm"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * EXEMPLO DE USO NO COMPONENTE DE DESPESAS
 */

// import { AIAnalysisPanel } from './AIAnalysisPanel';

// function DashboardDespesas() {
//     const despesasData = {
//         categories: [
//             { name: 'Salários', value: 50000, percentage: 40 },
//             { name: 'Marketing', value: 20000, percentage: 16 },
//             { name: 'Aluguel', value: 15000, percentage: 12 }
//         ],
//         total: 125000,
//         evolution: [
//             { month: 'Dez 2025', value: 120000 },
//             { month: 'Jan 2026', value: 125000 }
//         ]
//     };

//     return (
//         <div>
//             {/* Outros componentes do dashboard */}

//             {/* Painel de Análise com IA */}
//             <AIAnalysisPanel
//                 dashboardType="despesas"
//                 data={despesasData}
//                 period="Janeiro 2026"
//                 companyName="Minha Empresa"
//                 industry="Tecnologia"
//             />
//         </div>
//     );
// }

/**
 * EXEMPLO DE USO NO COMPONENTE DE DRE
 */

// function DashboardDRE() {
//     const dreData = {
//         receita_bruta: 500000,
//         deducoes: 50000,
//         receita_liquida: 450000,
//         cpv: 200000,
//         lucro_bruto: 250000,
//         despesas_operacionais: 150000,
//         lucro_operacional: 100000,
//         lucro_liquido: 80000,
//         margens: {
//             bruta: 55.6,
//             operacional: 22.2,
//             liquida: 17.8
//         }
//     };

//     return (
//         <div>
//             {/* Gráficos e tabelas do DRE */}

//             <AIAnalysisPanel
//                 dashboardType="dre"
//                 data={dreData}
//                 period="Q1 2026"
//             />
//         </div>
//     );
// }

/**
 * EXEMPLO DE USO NO COMPONENTE DE FLUXO DE CAIXA
 */

// function DashboardFluxoCaixa() {
//     const fluxoCaixaData = {
//         saldo_inicial: 100000,
//         entradas: {
//             operacionais: 200000,
//             investimentos: 50000,
//             financiamentos: 30000
//         },
//         saidas: {
//             operacionais: 150000,
//             investimentos: 80000,
//             financiamentos: 20000
//         },
//         saldo_final: 130000,
//         burn_rate: 25000,
//         runway: 5.2 // meses
//     };

//     return (
//         <div>
//             <AIAnalysisPanel
//                 dashboardType="fluxo_caixa"
//                 data={fluxoCaixaData}
//                 period="Janeiro 2026"
//             />
//         </div>
//     );
// }

export default AIAnalysisPanel;
