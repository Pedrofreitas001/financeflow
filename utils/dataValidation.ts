/**
 * Data Validation Utility with AI
 * 
 * This utility provides AI-powered validation for Excel/CSV files
 * before they are imported into the dashboard.
 * 
 * IMPORTANT: This is a VALIDATION-ONLY tool. It does NOT:
 * - Transform data
 * - Auto-correct errors
 * - Map columns automatically
 * 
 * It ONLY returns: OK or NEEDS_ADJUSTMENT with clear reasons
 */

export interface ColumnDefinition {
    key: string;
    type: 'date' | 'number' | 'text';
    required: boolean;
}

export interface DashboardPageConfig {
    [pageName: string]: {
        required_fields: ColumnDefinition[];
        optional_fields?: ColumnDefinition[];
    };
}

export interface DetectedColumn {
    name: string;
    type_detected: 'date' | 'number' | 'text' | 'mixed' | 'empty';
    sample_values: any[];
    null_count?: number;
    unique_count?: number;
}

export interface UploadedData {
    columns: DetectedColumn[];
    row_count: number;
    file_name: string;
    sheets?: string[];
}

export interface ValidationCheck {
    field: string;
    issue: 'missing_required' | 'wrong_type' | 'mixed_type' | 'empty_values' | 'low_volume' | 'invalid_format';
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    status: 'ok' | 'adjustment_needed';
    summary: string;
    checks: ValidationCheck[];
    ready_pages: string[];
    blocked_pages: string[];
    suggestions?: string[];
    current_capabilities?: string[]; // O que já pode ser visualizado
    missing_for_full?: string[]; // O que falta para funcionalidade completa
}

// Dashboard configuration - defines what each page needs
const DASHBOARD_CONFIG: DashboardPageConfig = {
    visao_geral: {
        required_fields: [
            { key: 'date', type: 'date', required: true },
            { key: 'amount', type: 'number', required: true }
        ],
        optional_fields: [
            { key: 'category', type: 'text', required: false },
            { key: 'region', type: 'text', required: false }
        ]
    },
    por_categoria: {
        required_fields: [
            { key: 'category', type: 'text', required: true },
            { key: 'amount', type: 'number', required: true }
        ],
        optional_fields: [
            { key: 'date', type: 'date', required: false }
        ]
    },
    dre: {
        required_fields: [
            { key: 'date', type: 'date', required: true },
            { key: 'account', type: 'text', required: true },
            { key: 'amount', type: 'number', required: true }
        ],
        optional_fields: [
            { key: 'cost_center', type: 'text', required: false },
            { key: 'nature', type: 'text', required: false }
        ]
    },
    fluxo_caixa: {
        required_fields: [
            { key: 'date', type: 'date', required: true },
            { key: 'type', type: 'text', required: true },
            { key: 'amount', type: 'number', required: true }
        ],
        optional_fields: [
            { key: 'description', type: 'text', required: false }
        ]
    },
    balancete: {
        required_fields: [
            { key: 'account', type: 'text', required: true },
            { key: 'debit_balance', type: 'number', required: true },
            { key: 'credit_balance', type: 'number', required: true }
        ],
        optional_fields: [
            { key: 'code', type: 'text', required: false },
            { key: 'group', type: 'text', required: false }
        ]
    }
};

/**
 * Analyzes an uploaded file and detects column types
 */
export function analyzeFileStructure(fileData: any[]): DetectedColumn[] {
    if (!fileData || fileData.length === 0) {
        return [];
    }

    const headers = Object.keys(fileData[0]);
    const detectedColumns: DetectedColumn[] = [];

    for (const header of headers) {
        const values = fileData.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
        const sampleValues = values.slice(0, 5);

        // Detect type
        let detectedType: DetectedColumn['type_detected'] = 'text';
        const types = new Set<string>();

        for (const value of values) {
            if (typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(value))) {
                types.add('number');
            } else if (isValidDate(value)) {
                types.add('date');
            } else {
                types.add('text');
            }
        }

        if (types.size === 0) {
            detectedType = 'empty';
        } else if (types.size === 1) {
            detectedType = Array.from(types)[0] as any;
        } else {
            detectedType = 'mixed';
        }

        detectedColumns.push({
            name: header,
            type_detected: detectedType,
            sample_values: sampleValues,
            null_count: fileData.length - values.length,
            unique_count: new Set(values).size
        });
    }

    return detectedColumns;
}

/**
 * Validates if a value is a valid date
 */
function isValidDate(value: any): boolean {
    if (value instanceof Date) return !isNaN(value.getTime());

    // Try parsing common date formats
    const datePatterns = [
        /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];

    const strValue = String(value).trim();
    if (datePatterns.some(pattern => pattern.test(strValue))) {
        const date = new Date(strValue);
        return !isNaN(date.getTime());
    }

    return false;
}

/**
 * Fuzzy match column names to expected field keys
 */
function matchColumnToField(columnName: string, fieldKey: string): number {
    const colLower = columnName.toLowerCase().trim();
    const keyLower = fieldKey.toLowerCase().trim();

    // Exact match
    if (colLower === keyLower) return 1.0;

    // Common synonyms
    const synonyms: { [key: string]: string[] } = {
        date: ['data', 'date', 'fecha', 'datum'],
        amount: ['valor', 'amount', 'value', 'montante', 'total'],
        category: ['categoria', 'category', 'tipo', 'type'],
        account: ['conta', 'account', 'contabil'],
        description: ['descrição', 'descricao', 'description', 'desc'],
        type: ['tipo', 'type', 'kind'],
        region: ['região', 'regiao', 'region', 'area'],
    };

    if (synonyms[keyLower]?.some(syn => colLower.includes(syn))) {
        return 0.8;
    }

    // Partial match
    if (colLower.includes(keyLower) || keyLower.includes(colLower)) {
        return 0.6;
    }

    return 0;
}

/**
 * Finds the best matching column for a required field
 */
function findMatchingColumn(
    fieldKey: string,
    fieldType: string,
    detectedColumns: DetectedColumn[]
): { column: DetectedColumn | null; confidence: number } {
    let bestMatch: DetectedColumn | null = null;
    let bestScore = 0;

    for (const col of detectedColumns) {
        const nameScore = matchColumnToField(col.name, fieldKey);
        const typeMatch = col.type_detected === fieldType || (col.type_detected === 'mixed' && fieldType === 'text');
        const typeScore = typeMatch ? 1.0 : 0.5;

        const totalScore = nameScore * 0.7 + typeScore * 0.3;

        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMatch = col;
        }
    }

    return { column: bestMatch, confidence: bestScore };
}

/**
 * Main validation function
 * Returns a clear OK or ADJUSTMENT_NEEDED response
 */
export function validateData(uploadedData: UploadedData, targetPages?: string[]): ValidationResult {
    const checks: ValidationCheck[] = [];
    const readyPages: string[] = [];
    const blockedPages: string[] = [];

    // Determine which pages to validate
    const pagesToValidate = targetPages || Object.keys(DASHBOARD_CONFIG);

    // Global checks
    if (uploadedData.row_count < 10) {
        checks.push({
            field: 'row_count',
            issue: 'low_volume',
            message: `Apenas ${uploadedData.row_count} linhas detectadas. Recomendamos pelo menos 30 registros para análises significativas.`,
            severity: 'warning'
        });
    }

    // Validate each page
    for (const pageName of pagesToValidate) {
        const pageConfig = DASHBOARD_CONFIG[pageName];
        if (!pageConfig) continue;

        let pageIsReady = true;

        // Check required fields
        for (const requiredField of pageConfig.required_fields) {
            const match = findMatchingColumn(
                requiredField.key,
                requiredField.type,
                uploadedData.columns
            );

            if (!match.column) {
                checks.push({
                    field: `${pageName}:${requiredField.key}`,
                    issue: 'missing_required',
                    message: `A página "${pageName}" requer uma coluna do tipo "${requiredField.type}" para "${requiredField.key}", mas não foi encontrada.`,
                    severity: 'error'
                });
                pageIsReady = false;
            } else if (match.confidence < 0.5) {
                checks.push({
                    field: match.column.name,
                    issue: 'invalid_format',
                    message: `A coluna "${match.column.name}" pode não estar no formato adequado para "${requiredField.key}".`,
                    severity: 'warning'
                });
            } else if (match.column.type_detected === 'mixed') {
                checks.push({
                    field: match.column.name,
                    issue: 'mixed_type',
                    message: `A coluna "${match.column.name}" contém valores mistos (números e textos). Use apenas valores do tipo ${requiredField.type}.`,
                    severity: 'error'
                });
                pageIsReady = false;
            } else if (match.column.type_detected === 'empty') {
                checks.push({
                    field: match.column.name,
                    issue: 'empty_values',
                    message: `A coluna "${match.column.name}" está vazia ou contém apenas valores nulos.`,
                    severity: 'error'
                });
                pageIsReady = false;
            } else if (match.column.type_detected !== requiredField.type) {
                checks.push({
                    field: match.column.name,
                    issue: 'wrong_type',
                    message: `A coluna "${match.column.name}" foi detectada como "${match.column.type_detected}", mas deveria ser "${requiredField.type}".`,
                    severity: 'error'
                });
                pageIsReady = false;
            }
        }

        if (pageIsReady) {
            readyPages.push(pageName);
        } else {
            blockedPages.push(pageName);
        }
    }

    // Determine overall status
    const hasErrors = checks.some(c => c.severity === 'error');
    const status = hasErrors ? 'adjustment_needed' : 'ok';

    const summary = status === 'ok'
        ? 'Seus dados estão corretos e prontos para gerar o dashboard!'
        : 'Alguns ajustes são necessários antes de gerar o dashboard.';

    return {
        status,
        summary,
        checks: checks.filter(c => c.severity === 'error'), // Only return errors for main display
        ready_pages: readyPages,
        blocked_pages: blockedPages,
        suggestions: hasErrors ? [
            'Revise as colunas indicadas acima',
            'Use nossos modelos de Excel como referência',
            'Certifique-se de que os tipos de dados estão corretos'
        ] : undefined
    };
}

/**
 * System prompt for AI validation (if using OpenAI/Anthropic API)
 */
export const AI_VALIDATION_SYSTEM_PROMPT = `Você é um especialista em validação de dados financeiros para dashboards analíticos.

CONTEXTO:
Você está validando arquivos Excel que serão importados em abas específicas de um dashboard financeiro.
Cada aba do dashboard (Visão Geral, Despesas, DRE, Fluxo de Caixa, Balancete) tem um template Excel específico e próprio.
Os templates definem EXATAMENTE quais colunas são necessárias e seus formatos.

IMPORTANTE - EQUIVALÊNCIA DE COLUNAS:
As colunas podem estar em PORTUGUÊS ou INGLÊS. Considere as seguintes equivalências:
- Data = Date
- Valor = Value = Amount
- Categoria = Category
- Descrição = Description
- Fornecedor = Supplier = Vendor
- Conta = Account
- Saldo = Balance
- Receita = Revenue = Income
- Despesa = Expense
- Tipo = Type
- Status = Status
- Mês = Month
- Ano = Year

Se uma coluna em inglês corresponde à coluna requerida em português (ou vice-versa), considere como PRESENTE.
NÃO reclame de colunas que são apenas traduções das colunas esperadas.

REGRAS OBRIGATÓRIAS:
1. NÃO critique o modelo base fornecido - ele é o padrão correto
2. NÃO sugira mudanças estruturais nos templates
3. NÃO faça comentários fora do escopo da aba selecionada
4. FOQUE apenas nas colunas que o usuário enviou vs. as colunas do template da aba
5. Seja CONSTRUTIVO: mostre o que está faltando e o que pode ser visualizado
6. Use formato positivo: "Com as colunas X, Y, Z você consegue visualizar..."
7. NÃO altere ou transforme dados automaticamente
8. Retorne APENAS JSON válido
9. ACEITE colunas em inglês ou português como equivalentes

FORMATO DA RESPOSTA:
Sempre estruture sua resposta de forma CLARA E OBJETIVA:

SEÇÃO 1 - O QUE VOCÊ TEM:
Liste TODAS as colunas encontradas no arquivo do usuário (incluindo versões em inglês/português).
Seja PRECISO: "Seu arquivo contém X colunas: [lista completa]"

SEÇÃO 2 - O QUE VOCÊ PODE VISUALIZAR:
Liste APENAS os gráficos/análises que SÃO POSSÍVEIS com as colunas atuais.
Se o arquivo tem Data, Categoria, Valor → pode visualizar evolução mensal, distribuição por categoria, etc.

SEÇÃO 3 - O QUE ESTÁ FALTANDO:
Liste APENAS as colunas OBRIGATÓRIAS que realmente estão AUSENTES.
IMPORTANTE: NÃO liste colunas que já existem em inglês/português.
Se o arquivo JÁ TEM todas as colunas obrigatórias → deixe esta seção VAZIA ou diga "Nada! Seu arquivo está completo."

SEÇÃO 4 - FUNCIONALIDADES OPCIONAIS:
Liste colunas OPCIONAIS que melhoram a análise (se aplicável).

EXEMPLO DE BOA RESPOSTA:
"✓ SEU ARQUIVO TEM: Data, Categoria, Valor, Descrição, Fornecedor, Tipo, Status (7 colunas)

✓ VOCÊ JÁ PODE VISUALIZAR:
- Evolução mensal de despesas
- Distribuição por categoria
- Análise por fornecedor
- Total acumulado e detalhamento

✓ O QUE ESTÁ FALTANDO: Nada! Seu arquivo está completo para a aba Despesas.

✓ FUNCIONALIDADES OPCIONAIS: Adicione 'Centro de Custo' para análise por departamento.

Status: ✅ PRONTO PARA IMPORTAR"

JSON DE RETORNO:
{
  "status": "ok" | "adjustment_needed",
  "summary": "Resumo OBJETIVO: 'Seu arquivo tem X colunas e está [COMPLETO/QUASE COMPLETO] para a aba Y'",
  "checks": [
    // IMPORTANTE: Inclua checks APENAS para colunas que REALMENTE estão faltando
    // Se a coluna existe em inglês/português, NÃO inclua aqui
    // Se TODAS as colunas obrigatórias existem, deixe este array VAZIO []
    {
      "field": "nome_da_coluna_que_REALMENTE_falta",
      "issue": "missing_required" | "wrong_type",
      "message": "Adicione a coluna [X] para [funcionalidade Y]",
      "severity": "error" | "warning"
    }
  ],
  "ready_pages": ["abas prontas para importar - se tem todas colunas obrigatórias"],
  "blocked_pages": ["abas que faltam colunas OBRIGATÓRIAS"],
  "current_capabilities": [
    "Liste TODOS os gráficos/análises possíveis com as colunas atuais",
    "Seja específico: 'Evolução mensal', 'Distribuição por categoria', etc."
  ],
  "missing_for_full": [
    "Liste APENAS colunas OPCIONAIS que melhoram análise",
    "NÃO inclua colunas que já existem em inglês/português"
  ]
}`;

/**
 * Generates the user prompt for AI validation with detailed template context
 */
export function generateAIValidationPrompt(uploadedData: UploadedData, targetPages?: string[]): string {
    const pagesToValidate = targetPages || Object.keys(DASHBOARD_CONFIG);
    const relevantConfig: any = {};

    for (const page of pagesToValidate) {
        if (DASHBOARD_CONFIG[page]) {
            relevantConfig[page] = DASHBOARD_CONFIG[page];
        }
    }

    // Mapear nomes técnicos para nomes amigáveis
    const pageNames: { [key: string]: string } = {
        'visao_geral': 'Visão Geral',
        'por_categoria': 'Despesas',
        'dre': 'DRE',
        'fluxo_caixa': 'Fluxo de Caixa',
        'balancete': 'Balancete'
    };

    const contextualPrompt = `
CONTEXTO DA VALIDAÇÃO:

O usuário selecionou as seguintes abas do dashboard: ${pagesToValidate.map(p => pageNames[p] || p).join(', ')}

CADA ABA TEM UM TEMPLATE EXCEL PRÓPRIO:
${Object.entries(relevantConfig).map(([key, config]: [string, any]) => {
        const pageName = pageNames[key] || key;
        const required = config.required_fields.map((f: any) => `${f.key} (${f.type})`).join(', ');
        const optional = config.optional_fields ? config.optional_fields.map((f: any) => `${f.key} (${f.type})`).join(', ') : 'Nenhuma';
        return `
${pageName}:
  - Colunas OBRIGATÓRIAS: ${required}
  - Colunas OPCIONAIS (melhoram visualizações): ${optional}`;
    }).join('\n')}

ARQUIVO ENVIADO PELO USUÁRIO:
Nome do arquivo: ${uploadedData.file_name}
Número de linhas: ${uploadedData.row_count}

Colunas detectadas:
${uploadedData.columns.map(col =>
        `- "${col.name}" (tipo detectado: ${col.type_detected}, valores de exemplo: ${col.sample_values.slice(0, 3).join(', ')})`
    ).join('\n')}

INSTRUÇÕES:
1. PRIMEIRA ETAPA: Liste TODAS as colunas detectadas no arquivo do usuário
2. SEGUNDA ETAPA: Compare com o template da aba selecionada
3. TERCEIRA ETAPA: Verifique equivalências português/inglês (Data=Date, Valor=Value, etc.)
4. QUARTA ETAPA: Se a coluna existe (em qualquer idioma), considere como PRESENTE
5. QUINTA ETAPA: Liste apenas o que REALMENTE falta (colunas obrigatórias ausentes)

IMPORTANTE: Se uma coluna está em inglês mas corresponde à coluna requerida em português (ou vice-versa), considere como PRESENTE.
Exemplo: Se o template pede "Data" e o arquivo tem "Date", está CORRETO. NÃO reclame disso.

Mostre o que ELE JÁ TEM e o que PODE FAZER com isso.
Indique o que FALTA para funcionalidade completa (apenas se realmente faltar).
Seja POSITIVO e CONSTRUTIVO.
`;

    return contextualPrompt;
}
