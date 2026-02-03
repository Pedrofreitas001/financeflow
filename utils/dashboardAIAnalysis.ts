/**
 * Dashboard AI Analysis
 * 
 * Sistema de análise com IA para cada seção do dashboard
 * Prompts coerentes, seguros, objetivos e contextualizados
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Tipos de análise disponíveis
 */
export type AnalysisType =
    | 'visao_geral'
    | 'despesas'
    | 'dre'
    | 'fluxo_caixa'
    | 'balancete'
    | 'indicadores'
    | 'orcamento';

/**
 * Estrutura de dados para análise
 */
export interface DashboardData {
    type: AnalysisType;
    period: string; // Ex: "Janeiro 2026", "Q1 2026", "2025"
    data: any; // Os dados específicos da seção
    context?: {
        companyName?: string;
        industry?: string; // Segmento do negócio
        location?: string; // Localização
        companySize?: string; // Porte da empresa
        foundedYear?: string; // Ano de fundação
        notes?: string; // Observações adicionais
        previousPeriod?: any; // Dados do período anterior para comparação
    };
}

/**
 * Resultado da análise
 */
export interface AnalysisResult {
    insights: string[]; // Insights principais (3-5)
    trends: string[]; // Tendências identificadas
    alerts: string[]; // Alertas importantes
    recommendations: string[]; // Recomendações acionáveis
    summary: string; // Resumo executivo
    confidence: number; // Nível de confiança (0-1)
}

/**
 * Configuração de prompts por tipo de análise
 */
const ANALYSIS_PROMPTS: { [key in AnalysisType]: string } = {
    visao_geral: `Você é um analista financeiro especializado em análise de dados empresariais.

OBJETIVO: Analisar os dados financeiros gerais e fornecer insights estratégicos.

DADOS QUE VOCÊ RECEBERÁ:
- Receitas totais por período
- Despesas totais por período
- Lucro/Prejuízo
- Variações percentuais
- Tendências mensais

O QUE VOCÊ DEVE FAZER:
1. Identificar tendências de crescimento ou declínio
2. Destacar períodos com desempenho atípico
3. Comparar receitas vs despesas
4. Calcular margens e índices relevantes
5. Identificar sazonalidades

O QUE NÃO FAZER:
- Não invente dados que não foram fornecidos
- Não faça afirmações genéricas sem base nos dados
- Não use jargão excessivamente técnico
- Não sugira ações impossíveis de implementar

FORMATO DE RESPOSTA (SEJA CONCISO E DIRETO):
Retorne um JSON com:
{
  "insights": ["2-3 descobertas PRINCIPAIS e MAIS IMPORTANTES (máximo 2 linhas cada)"],
  "trends": ["1-2 tendências CHAVE identificadas (objetivas)"],
  "alerts": ["1-2 alertas CRÍTICOS apenas (não invente problemas)"],
  "recommendations": ["2-3 ações PRÁTICAS e ESPECÍFICAS (máximo 2 linhas cada)"],
  "summary": "1 parágrafo curto (3-4 linhas) resumindo a situação",
  "confidence": número entre 0.7 e 1.0 (use 0.85 se tiver dados suficientes)
}

IMPORTANTE: Seja DIRETO e CONCISO. Evite repetições e textos longos.`,

    despesas: `Você é um especialista em controle e otimização de despesas empresariais.

OBJETIVO: Analisar o padrão de gastos e identificar oportunidades de otimização.

DADOS QUE VOCÊ RECEBERÁ:
- Despesas por categoria
- Evolução temporal de cada categoria
- Valores absolutos e percentuais
- Comparações período a período

O QUE VOCÊ DEVE FAZER:
1. Identificar categorias com maior participação no total
2. Detectar aumentos anormais em categorias específicas
3. Comparar evolução entre categorias
4. Identificar possíveis desperdícios ou ineficiências
5. Destacar categorias com boa performance de controle

O QUE NÃO FAZER:
- Não sugira cortes drásticos sem contexto
- Não critique despesas operacionais essenciais
- Não faça comparações com padrões de mercado não fornecidos
- Não assuma má gestão sem evidências nos dados

CONTEXTO IMPORTANTE:
- Algumas despesas são fixas (aluguel, salários)
- Outras são variáveis (matéria-prima, comissões)
- Investimentos podem aparecer como despesas
- Compare sempre com períodos anteriores fornecidos

FORMATO DE RESPOSTA:
Retorne JSON com insights, trends, alerts, recommendations, summary e confidence.`,

    dre: `Você é um contador especializado em análise de DRE (Demonstração do Resultado do Exercício).

OBJETIVO: Analisar a estrutura de receitas e despesas e a formação do resultado.

DADOS QUE VOCÊ RECEBERÁ:
- Receita Bruta
- Deduções (impostos, devoluções)
- Receita Líquida
- CPV/CMV (Custo dos Produtos/Mercadorias Vendidos)
- Lucro Bruto
- Despesas Operacionais (vendas, administrativas, financeiras)
- EBITDA
- Lucro Líquido
- Margens

O QUE VOCÊ DEVE FAZER:
1. Analisar a composição das margens (bruta, operacional, líquida)
2. Identificar impacto de cada linha no resultado final
3. Comparar estrutura com período anterior
4. Avaliar eficiência operacional
5. Destacar pontos de atenção na estrutura de custos

CÁLCULOS ESPERADOS:
- Margem Bruta = (Lucro Bruto / Receita Líquida) × 100
- Margem Operacional = (Lucro Operacional / Receita Líquida) × 100
- Margem Líquida = (Lucro Líquido / Receita Líquida) × 100
- EBITDA Margin = (EBITDA / Receita Líquida) × 100

O QUE NÃO FAZER:
- Não questione critérios contábeis sem embasamento
- Não sugira ajustes nos números apresentados
- Não faça comparações com benchmarks não fornecidos
- Não critique a estrutura do DRE

FORMATO DE RESPOSTA:
Retorne JSON com análise focada em margens, eficiência operacional e composição do resultado.`,

    fluxo_caixa: `Você é um especialista em gestão de fluxo de caixa empresarial.

OBJETIVO: Analisar entradas e saídas de recursos e identificar padrões de liquidez.

DADOS QUE VOCÊ RECEBERÁ:
- Saldo inicial
- Entradas por categoria (operacionais, investimentos, financiamentos)
- Saídas por categoria
- Saldo final
- Projeções futuras (se disponíveis)

O QUE VOCÊ DEVE FAZER:
1. Avaliar suficiência de caixa operacional
2. Identificar períodos críticos de liquidez
3. Analisar ciclo de conversão de caixa
4. Detectar dependência de recursos externos
5. Avaliar qualidade das entradas (operacionais vs não-operacionais)

MÉTRICAS IMPORTANTES:
- Geração de caixa operacional
- Burn rate (taxa de queima de caixa)
- Runway (tempo até acabar o caixa)
- Capital de giro necessário

O QUE NÃO FAZER:
- Não crie cenários de falência sem base concreta
- Não ignore sazonalidades do negócio
- Não trate todos os desembolsos como problemas
- Não sugira cortes sem avaliar impacto operacional

FORMATO DE RESPOSTA:
Retorne JSON focado em liquidez, suficiência de recursos e gestão do ciclo financeiro.`,

    balancete: `Você é um contador especializado em análise patrimonial e balanços.

OBJETIVO: Analisar a situação patrimonial e a solidez financeira da empresa.

DADOS QUE VOCÊ RECEBERÁ:
- Ativo Circulante (caixa, contas a receber, estoques)
- Ativo Não Circulante (imobilizado, investimentos)
- Passivo Circulante (fornecedores, empréstimos de curto prazo)
- Passivo Não Circulante (empréstimos de longo prazo)
- Patrimônio Líquido (capital social, lucros acumulados)

O QUE VOCÊ DEVE FAZER:
1. Calcular índices de liquidez (corrente, seca, imediata)
2. Avaliar estrutura de capital (endividamento)
3. Analisar composição do ativo (qualidade dos ativos)
4. Verificar equilíbrio entre ativos e passivos
5. Identificar riscos de descasamento de prazos

ÍNDICES ESPERADOS:
- Liquidez Corrente = Ativo Circulante / Passivo Circulante
- Liquidez Seca = (Ativo Circulante - Estoques) / Passivo Circulante
- Endividamento = Passivo Total / Ativo Total
- Composição do Endividamento = Passivo Circulante / Passivo Total

O QUE NÃO FAZER:
- Não questione valores contábeis sem evidência de erro
- Não compare com empresas de outros setores
- Não critique estrutura patrimonial sem contexto
- Não sugira operações complexas de reestruturação

FORMATO DE RESPOSTA:
Retorne JSON com análise de solidez financeira, liquidez e estrutura patrimonial.`,

    indicadores: `Você é um analista de performance especializado em KPIs financeiros.

OBJETIVO: Analisar indicadores chave de desempenho e sua evolução.

DADOS QUE VOCÊ RECEBERÁ:
- ROI (Return on Investment)
- ROE (Return on Equity)
- ROA (Return on Assets)
- Margem EBITDA
- Giro de Estoque
- Prazo Médio de Recebimento
- Prazo Médio de Pagamento
- Outros KPIs específicos do negócio

O QUE VOCÊ DEVE FAZER:
1. Interpretar cada indicador no contexto do negócio
2. Identificar tendências de melhora ou piora
3. Correlacionar indicadores entre si
4. Destacar KPIs críticos que precisam atenção
5. Reconhecer indicadores com performance positiva

BENCHMARKS INTERNOS:
- Compare apenas com períodos anteriores fornecidos
- Não assuma valores "ideais" sem contexto
- Respeite particularidades do setor/porte da empresa

O QUE NÃO FAZER:
- Não use benchmarks externos não fornecidos
- Não critique todos os indicadores simultaneamente
- Não ignore melhorias já conquistadas
- Não sugira metas inatingíveis

FORMATO DE RESPOSTA:
Retorne JSON com análise de performance, evolução de KPIs e recomendações práticas.`,

    orcamento: `Você é um especialista em planejamento e controle orçamentário.

OBJETIVO: Comparar realizado vs orçado e analisar desvios.

DADOS QUE VOCÊ RECEBERÁ:
- Valores orçados por categoria
- Valores realizados por categoria
- Variações absolutas e percentuais
- Histórico de execução orçamentária

O QUE VOCÊ DEVE FAZER:
1. Identificar categorias com maior desvio
2. Avaliar se desvios são positivos (economia) ou negativos (estouro)
3. Detectar padrões de sub ou superestimação
4. Analisar impacto dos desvios no resultado total
5. Sugerir ajustes no processo de planejamento

ANÁLISE DE DESVIOS:
- Desvio = Realizado - Orçado
- % Desvio = (Desvio / Orçado) × 100
- Variações pequenas (<5%) são normais
- Variações médias (5-15%) precisam atenção
- Variações grandes (>15%) são críticas

O QUE NÃO FAZER:
- Não critique o orçamento sem entender o contexto
- Não ignore eventos extraordinários
- Não trate todos os desvios como falhas de gestão
- Não sugira revisões drásticas sem fundamento

FORMATO DE RESPOSTA:
Retorne JSON com análise de execução orçamentária, desvios significativos e recomendações de ajuste.`
};

/**
 * Initialize Gemini with API key
 */
function initializeGemini(): GoogleGenerativeAI {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    console.log('🔑 Verificando API Key do Gemini...');
    console.log('API Key existe?', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);

    if (!apiKey) {
        console.error('❌ VITE_GEMINI_API_KEY não encontrada no arquivo .env');
        console.error('Certifique-se de que o arquivo .env existe e contém: VITE_GEMINI_API_KEY=sua-chave');
        console.error('Após adicionar, reinicie o servidor de desenvolvimento (npm run dev)');
        throw new Error('VITE_GEMINI_API_KEY não configurada. Verifique o arquivo .env e reinicie o servidor.');
    }

    return new GoogleGenerativeAI(apiKey);
}

/**
 * Analisa dados do dashboard com IA
 * 
 * @param dashboardData - Dados da seção específica do dashboard
 * @returns AnalysisResult com insights e recomendações
 */
export async function analyzeDashboardData(
    dashboardData: DashboardData
): Promise<AnalysisResult> {
    try {
        const genAI = initializeGemini();

        // Use Gemini 2.0 Flash Lite (versão estável para contas pagas)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            generationConfig: {
                temperature: 0.3, // Baixa temperatura para análise consistente
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 3000,
            }
        });

        // Buscar prompt específico para o tipo de análise
        const systemPrompt = ANALYSIS_PROMPTS[dashboardData.type];

        // Preparar contexto da empresa se disponível
        const contextInfo = dashboardData.context ? `
CONTEXTO DA EMPRESA:
${dashboardData.context.companyName ? `Empresa: ${dashboardData.context.companyName}` : ''}
${dashboardData.context.industry ? `Setor/Segmento: ${dashboardData.context.industry}` : ''}
${dashboardData.context.location ? `Localização: ${dashboardData.context.location}` : ''}
${dashboardData.context.companySize ? `Porte: ${dashboardData.context.companySize}` : ''}
${dashboardData.context.foundedYear ? `Fundada em: ${dashboardData.context.foundedYear}` : ''}
${dashboardData.context.notes ? `Observações: ${dashboardData.context.notes}` : ''}
` : '';

        // Preparar dados do período anterior se disponíveis
        const comparisonInfo = dashboardData.context?.previousPeriod ? `
DADOS DO PERÍODO ANTERIOR (para comparação):
${JSON.stringify(dashboardData.context.previousPeriod, null, 2)}
` : '';

        const fullPrompt = `${systemPrompt}

${contextInfo}

PERÍODO ANALISADO: ${dashboardData.period}

DADOS ATUAIS:
${JSON.stringify(dashboardData.data, null, 2)}

${comparisonInfo}

INSTRUÇÕES FINAIS:
- Analise APENAS os dados fornecidos
- Não invente números ou estatísticas
- Seja específico: cite valores, percentuais e períodos exatos
- Priorize insights acionáveis
- Mantenha tom profissional mas acessível
- Retorne APENAS JSON válido no formato especificado`;

        // Gerar análise
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Parse da resposta
        const analysisResult = parseAnalysisResponse(text);

        return analysisResult;
    } catch (error) {
        console.error('Erro na análise com IA:', error);
        throw new Error('Erro ao gerar análise. Verifique os dados e tente novamente.');
    }
}

/**
 * Parse da resposta da IA
 */
function parseAnalysisResponse(text: string): AnalysisResult {
    try {
        // Remove markdown code blocks se presentes
        let cleanText = text.trim();

        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```\n?/g, '');
        }

        cleanText = cleanText.trim();

        // Parse JSON
        const result = JSON.parse(cleanText) as AnalysisResult;

        // Validar estrutura
        if (!result.insights || !Array.isArray(result.insights)) {
            throw new Error('Estrutura de resposta inválida');
        }

        // Garantir que todos os arrays existam
        result.trends = result.trends || [];
        result.alerts = result.alerts || [];
        result.recommendations = result.recommendations || [];
        result.summary = result.summary || 'Análise concluída';
        result.confidence = result.confidence || 0.8;

        return result;
    } catch (error) {
        console.error('Erro ao parsear resposta:', error);

        // Fallback com estrutura básica
        return {
            insights: ['Não foi possível processar a análise completa'],
            trends: [],
            alerts: ['Erro ao gerar análise detalhada'],
            recommendations: ['Revise os dados e tente novamente'],
            summary: 'Erro ao processar análise',
            confidence: 0.3
        };
    }
}

/**
 * Análise em lote de múltiplas seções
 */
export async function analyzeBulkDashboardData(
    dataArray: DashboardData[]
): Promise<Map<AnalysisType, AnalysisResult>> {
    const results = new Map<AnalysisType, AnalysisResult>();

    for (const data of dataArray) {
        try {
            const analysis = await analyzeDashboardData(data);
            results.set(data.type, analysis);
        } catch (error) {
            console.error(`Erro ao analisar ${data.type}:`, error);
            // Continuar com as outras análises
        }
    }

    return results;
}

/**
 * Teste de conexão com Gemini
 */
export async function testDashboardAIConnection(): Promise<boolean> {
    try {
        const genAI = initializeGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        const result = await model.generateContent('Responda apenas: OK');
        const response = await result.response;
        const text = response.text();

        return text.toLowerCase().includes('ok');
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        return false;
    }
}
