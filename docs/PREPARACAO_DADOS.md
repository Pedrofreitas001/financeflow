# 📊 Sistema de Preparação de Dados

## Visão Geral

Este é o sistema de preparação e validação de dados para o Dashboard Financeiro. Esta funcionalidade é **essencial para conversão e retenção** de usuários, pois reduz a fricção no processo de importação de dados.

## 🎯 Objetivo

Permitir que usuários preparem seus dados de forma simples e validem antes da importação, garantindo:

- **Facilidade**: Modelos prontos para download
- **Confiança**: Validação prévia sem alterações
- **Clareza**: Feedback objetivo sobre o que precisa ser ajustado

## 📁 Arquivos Principais

### 1. Página de Preparação de Dados
**Arquivo**: `landing/pages/DataPreparation.tsx`

Esta é a página dedicada que os usuários acessam para:
- Entender como preparar os dados
- Baixar modelos de Excel
- Validar seus arquivos antes de importar

#### Seções da Página:

1. **Hero Section**: CTA claro com download e validação
2. **Como Funciona**: 3 passos simples (prepara → valida → gera)
3. **Abas do Dashboard**: Detalhamento de colunas obrigatórias/opcionais para cada aba
4. **Modelos de Excel**: Download dos templates
5. **Validação com IA**: Interface para upload e validação
6. **FAQ**: Perguntas frequentes

### 2. Utilitário de Validação
**Arquivo**: `utils/dataValidation.ts`

Contém toda a lógica de validação de dados:

```typescript
// Funções principais:
- analyzeFileStructure(): Analisa estrutura do arquivo
- validateData(): Valida dados contra configuração
- matchColumnToField(): Faz match fuzzy de colunas
- generateAIValidationPrompt(): Gera prompt para IA
```

#### Sistema de Validação

A validação funciona em **2 modos**:

**Modo 1: Validação Local (JavaScript)**
- Análise rápida de tipos de dados
- Detecção de colunas
- Match fuzzy de nomes de colunas
- Retorna: OK ou AJUSTES_NECESSÁRIOS

**Modo 2: Validação com IA (Opcional)**
- Usa OpenAI/Anthropic para validação mais inteligente
- Detecta padrões complexos
- Sugere correções específicas

### 3. Gerador de Templates Excel
**Arquivo**: `utils/excelTemplates.ts`

Gera modelos de Excel para download:

```typescript
// Templates disponíveis:
- Visão Geral
- Por Categoria
- DRE
- Fluxo de Caixa
- Balancete
- Completo (todas as abas)
```

Cada template inclui:
- Dados de exemplo preenchidos
- Comentários nas células explicando cada campo
- Formatação adequada

## 🔧 Configuração

### Instalação de Dependências

```bash
npm install xlsx file-saver
npm install --save-dev @types/file-saver
```

### Integração no Roteamento

A página está integrada em `App.tsx`:

```typescript
<Route path="/preparar-dados" element={<DataPreparation />} />
```

Links adicionados em:
- Navbar principal
- Menu mobile
- CTAs na home

## 🎨 Design e UX

### Princípios de Design

1. **Visual e Objetivo**: Informações claras e diretas
2. **Sem Jargão Técnico**: Linguagem acessível
3. **CTAs Claros**: Ações óbvias e destacadas
4. **Feedback Imediato**: Resposta rápida da validação

### Cores e Tema

- Background: Gradiente azul escuro (`from-gray-900 via-blue-900`)
- Acentos: Azul (`bg-blue-600`)
- Texto: Branco com variações de opacidade
- Cards: `bg-white/5` com backdrop blur

## 🤖 Sistema de IA - Validação

### Integração com Google Gemini

O sistema usa **Google Gemini AI** para validação inteligente de dados.

**Arquivo**: `utils/geminiValidation.ts`

#### Configuração Rápida

1. Obter API Key: https://makersuite.google.com/app/apikey
2. Instalar SDK: `npm install @google/generative-ai`
3. Configurar `.env`:
```bash
VITE_GEMINI_API_KEY=sua_api_key_aqui
```

4. Usar no código:
```typescript
import { validateWithGemini } from './utils/geminiValidation';

const result = await validateWithGemini(uploadedData);
```

**📖 Guia completo**: Ver [GEMINI_SETUP.md](./GEMINI_SETUP.md)

### Prompt de Sistema (System Prompt)

```
Você é um validador de dados para dashboards analíticos.

REGRAS OBRIGATÓRIAS:
- NÃO altere dados
- NÃO sugira transformações técnicas
- NÃO use linguagem vaga
- Seja objetivo e direto
- Retorne APENAS JSON válido
```

### Formato de Resposta da IA

```json
{
  "status": "ok" | "adjustment_needed",
  "summary": "Descrição clara do resultado",
  "checks": [
    {
      "field": "nome_da_coluna",
      "issue": "tipo_do_problema",
      "message": "Descrição clara do problema"
    }
  ],
  "ready_pages": ["lista_de_páginas_prontas"],
  "blocked_pages": ["lista_de_páginas_bloqueadas"]
}
```

### Tipos de Issues

- `missing_required`: Campo obrigatório ausente
- `wrong_type`: Tipo de dado incorreto
- `mixed_type`: Valores mistos na coluna
- `empty_values`: Coluna vazia
- `low_volume`: Poucos dados
- `invalid_format`: Formato inválido

## 📊 Configuração de Abas

Cada aba do dashboard tem campos obrigatórios e opcionais definidos em `dataValidation.ts`:

```typescript
const DASHBOARD_CONFIG = {
  visao_geral: {
    required_fields: [
      { key: 'date', type: 'date', required: true },
      { key: 'amount', type: 'number', required: true }
    ],
    optional_fields: [
      { key: 'category', type: 'text', required: false }
    ]
  },
  // ... outras abas
}
```

## 🚀 Como Usar

### Para o Usuário Final

1. Acessar `/preparar-dados`
2. Escolher uma opção:
   - Baixar modelo pronto
   - Validar arquivo próprio
3. Se validar:
   - Upload do arquivo
   - Clicar em "Validar"
   - Ver resultado
   - Ajustar se necessário

### Para o Desenvolvedor

#### Adicionar Nova Aba

1. Adicionar configuração em `dataValidation.ts`:
```typescript
nova_aba: {
  required_fields: [
    { key: 'campo1', type: 'text', required: true }
  ]
}
```

2. Adicionar na lista de abas em `DataPreparation.tsx`:
```typescript
{
  id: 'nova_aba',
  name: 'Nova Aba',
  description: 'Descrição',
  requiredColumns: [...],
  optionalColumns: [...]
}
```

3. Criar template em `excelTemplates.ts`:
```typescript
export function generateNovaAbaTemplate() {
  // ... implementação
}
```

#### Integrar com Gemini AI

Para usar validação com Gemini:

1. Instalar SDK:
```bash
npm install @google/generative-ai
```

2. Configurar API Key no `.env`:
```bash
VITE_GEMINI_API_KEY=sua_chave_aqui
```

3. Usar no componente:
```typescript
import { validateWithGemini } from './utils/geminiValidation';

const handleValidation = async () => {
  setIsValidating(true);
  
  try {
    // Validação com Gemini
    const result = await validateWithGemini(uploadedData);
    setValidationResult(result);
  } catch (error) {
    // Fallback para validação local
    const result = validateData(uploadedData);
    setValidationResult(result);
  } finally {
    setIsValidating(false);
  }
};
```

4. Funcionalidades adicionais:
```typescript
// Validação com streaming (tempo real)
await validateWithGeminiStreaming(uploadedData, undefined, (chunk) => {
  console.log('Progresso:', chunk);
});

// Obter sugestões de correção
const suggestions = await getAISuggestions(validationResult, uploadedData);

// Testar conexão
const isConnected = await testGeminiConnection();
```

**Ver guia completo**: [GEMINI_SETUP.md](./GEMINI_SETUP.md)

## 📋 Regras de Ouro

### ✅ O Sistema DEVE:
- Validar dados objetivamente
- Informar claramente o que está errado
- Mostrar exemplos visuais
- Fornecer templates prontos
- Dar feedback imediato

### ❌ O Sistema NÃO DEVE:
- Alterar dados do usuário
- Corrigir automaticamente
- Usar linguagem técnica demais
- Fazer suposições sobre dados
- Forçar formatos rígidos

## 🔐 Segurança e Privacidade

- Dados são processados no cliente (quando possível)
- Se usar IA, enviar apenas metadados (não dados completos)
- Não armazenar arquivos do usuário
- Validação é temporária e descartada

## 📈 Métricas de Sucesso

Acompanhe:
- Taxa de download de templates
- Taxa de validação bem-sucedida
- Tempo médio até primeiro sucesso
- Taxa de conversão após validação

## 🐛 Troubleshooting

### Problema: Download não funciona
**Solução**: Verificar se `file-saver` está instalado

### Problema: Validação muito lenta
**Solução**: Usar validação local primeiro, IA apenas se necessário

### Problema: Match de colunas incorreto
**Solução**: Ajustar sinônimos em `matchColumnToField()`

## 🎓 Próximos Passos

1. ✅ Página criada
2. ✅ Validação local implementada
3. ⏳ Integrar com API de IA real
4. ⏳ Criar templates Excel reais (requer xlsx)
5. ⏳ Adicionar analytics de uso
6. ⏳ Criar vídeos tutoriais

## 📞 Suporte

Para dúvidas sobre implementação:
- Revisar código em `landing/pages/DataPreparation.tsx`
- Verificar utilitários em `utils/dataValidation.ts`
- Consultar este README

---

**Última atualização**: 03/02/2026
**Versão**: 1.0.0
