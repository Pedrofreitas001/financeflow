/**
 * Gemini AI Integration for Data Validation
 * 
 * This module integrates Google's Gemini API for intelligent
 * data validation without altering user data.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    type UploadedData,
    type ValidationResult,
    AI_VALIDATION_SYSTEM_PROMPT,
    generateAIValidationPrompt
} from './dataValidation';

/**
 * Initialize Gemini with API key from environment
 */
function initializeGemini(): GoogleGenerativeAI {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY não configurada no arquivo .env');
    }

    return new GoogleGenerativeAI(apiKey);
}

/**
 * Validate data using Gemini AI
 * 
 * @param uploadedData - The parsed and analyzed file data
 * @param targetPages - Optional array of specific pages to validate
 * @returns ValidationResult with detailed feedback
 */
export async function validateWithGemini(
    uploadedData: UploadedData,
    targetPages?: string[]
): Promise<ValidationResult> {
    try {
        const genAI = initializeGemini();

        // Use Gemini 2.0 Flash Lite
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            generationConfig: {
                temperature: 0.1, // Low temperature for consistent validation
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });

        // Prepare the prompt
        const systemInstructions = AI_VALIDATION_SYSTEM_PROMPT;
        const userPrompt = generateAIValidationPrompt(uploadedData, targetPages);

        // Create the full prompt
        const fullPrompt = `${systemInstructions}

DADOS PARA VALIDAÇÃO:
${userPrompt}

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional antes ou depois.`;

        // Generate validation result
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        console.log('Resposta do Gemini (validação):', text);

        // Parse the JSON response
        const validationResult = parseGeminiResponse(text);

        return validationResult;
    } catch (error) {
        console.error('Erro na validação com Gemini:', error);

        // Log detalhado do erro
        if (error instanceof Error) {
            console.error('Mensagem:', error.message);
            console.error('Stack:', error.stack);
        }

        // Fallback to local validation if Gemini fails
        throw new Error(
            error instanceof Error ? error.message : 'Erro ao validar com IA. Tente novamente.'
        );
    }
}

/**
 * Parse Gemini's response and extract JSON
 */
function parseGeminiResponse(text: string): ValidationResult {
    try {
        // Remove markdown code blocks if present
        let cleanText = text.trim();

        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```\n?/g, '');
        }

        cleanText = cleanText.trim();

        // Parse JSON
        const result = JSON.parse(cleanText) as ValidationResult;

        // Validate structure
        if (!result.status || !result.summary || !Array.isArray(result.checks)) {
            throw new Error('Resposta da IA em formato inválido');
        }

        return result;
    } catch (error) {
        console.error('Erro ao parsear resposta do Gemini:', error);
        throw new Error('Não foi possível processar a resposta da IA');
    }
}

/**
 * Validate with streaming (optional, for real-time feedback)
 */
export async function validateWithGeminiStreaming(
    uploadedData: UploadedData,
    targetPages?: string[],
    onChunk?: (chunk: string) => void
): Promise<ValidationResult> {
    try {
        const genAI = initializeGemini();
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });

        const systemInstructions = AI_VALIDATION_SYSTEM_PROMPT;
        const userPrompt = generateAIValidationPrompt(uploadedData, targetPages);

        const fullPrompt = `${systemInstructions}

DADOS PARA VALIDAÇÃO:
${userPrompt}

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional.`;

        // Generate with streaming
        const result = await model.generateContentStream(fullPrompt);

        let fullText = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;

            if (onChunk) {
                onChunk(chunkText);
            }
        }

        return parseGeminiResponse(fullText);
    } catch (error) {
        console.error('Erro na validação com streaming:', error);
        throw new Error('Erro ao validar com IA em streaming');
    }
}

/**
 * Test Gemini connection
 */
export async function testGeminiConnection(): Promise<boolean> {
    try {
        const genAI = initializeGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const result = await model.generateContent('Responda apenas: OK');
        const response = await result.response;
        const text = response.text();

        return text.toLowerCase().includes('ok');
    } catch (error) {
        console.error('Erro ao testar conexão com Gemini:', error);
        return false;
    }
}

/**
 * Get AI suggestions for fixing validation errors
 */
export async function getAISuggestions(
    validationResult: ValidationResult,
    uploadedData: UploadedData
): Promise<string[]> {
    try {
        const genAI = initializeGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `Dado este resultado de validação de dados:

${JSON.stringify(validationResult, null, 2)}

E estas colunas detectadas:
${JSON.stringify(uploadedData.columns.map(c => ({ name: c.name, type: c.type_detected })), null, 2)}

Forneça 3-5 sugestões PRÁTICAS e OBJETIVAS de como corrigir os problemas.
Seja específico sobre quais células ou colunas modificar.
NÃO sugira transformações automáticas.
Retorne apenas um array JSON de strings.

Exemplo: ["Remova os símbolos 'R$' da coluna Valor", "Formate as datas como DD/MM/YYYY"]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse suggestions
        const cleanText = text.trim().replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
        const suggestions = JSON.parse(cleanText) as string[];

        return suggestions;
    } catch (error) {
        console.error('Erro ao gerar sugestões:', error);
        return [
            'Verifique se todas as colunas obrigatórias estão presentes',
            'Certifique-se de que os tipos de dados estão corretos',
            'Use nossos modelos de Excel como referência'
        ];
    }
}

/**
 * Batch validation for multiple files
 */
export async function validateMultipleFiles(
    files: UploadedData[],
    targetPages?: string[]
): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const file of files) {
        try {
            const result = await validateWithGemini(file, targetPages);
            results.push(result);
        } catch (error) {
            // Add error result
            results.push({
                status: 'adjustment_needed',
                summary: `Erro ao validar arquivo ${file.file_name}`,
                checks: [{
                    field: 'file',
                    issue: 'invalid_format',
                    message: 'Não foi possível validar este arquivo',
                    severity: 'error'
                }],
                ready_pages: [],
                blocked_pages: []
            });
        }
    }

    return results;
}
