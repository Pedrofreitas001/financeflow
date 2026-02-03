# 🤖 Configuração Gemini AI - Validação de Dados

## Visão Geral

Este guia mostra como configurar a API do Google Gemini para validação inteligente de dados no sistema de preparação de dados.

## 📋 Pré-requisitos

1. Conta Google
2. Acesso ao [Google AI Studio](https://makersuite.google.com/app/apikey)
3. API Key do Gemini

## 🔑 Obter API Key do Gemini

### Passo 1: Acessar Google AI Studio

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Get API Key" ou "Create API Key"

### Passo 2: Criar uma API Key

1. Clique em "Create API Key in new project" (ou use um projeto existente)
2. A chave será gerada automaticamente
3. **IMPORTANTE**: Copie a chave e guarde em local seguro

### Passo 3: Configurar no Projeto

1. Crie/edite o arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_GEMINI_API_KEY=sua_api_key_aqui
```

2. Adicione `.env` no `.gitignore` (se ainda não estiver):

```bash
# .gitignore
.env
.env.local
.env.production
```

## 📦 Instalação da Biblioteca

Instale o SDK oficial do Google:

```bash
npm install @google/generative-ai
```

## 🚀 Uso Básico

### Validação Simples

```typescript
import { validateWithGemini } from './utils/geminiValidation';

// Após fazer upload e análise do arquivo
const validationResult = await validateWithGemini(uploadedData);

if (validationResult.status === 'ok') {
  console.log('✅ Dados prontos para importar!');
} else {
  console.log('❌ Ajustes necessários:');
  validationResult.checks.forEach(check => {
    console.log(`- ${check.field}: ${check.message}`);
  });
}
```

### Validação com Streaming (Tempo Real)

```typescript
import { validateWithGeminiStreaming } from './utils/geminiValidation';

const result = await validateWithGeminiStreaming(
  uploadedData,
  undefined, // targetPages (opcional)
  (chunk) => {
    // Atualizar UI com progresso
    console.log('Recebendo:', chunk);
  }
);
```

### Obter Sugestões de Correção

```typescript
import { getAISuggestions } from './utils/geminiValidation';

const suggestions = await getAISuggestions(validationResult, uploadedData);

suggestions.forEach(suggestion => {
  console.log(`💡 ${suggestion}`);
});
```

### Testar Conexão

```typescript
import { testGeminiConnection } from './utils/geminiValidation';

const isConnected = await testGeminiConnection();

if (isConnected) {
  console.log('✅ Gemini conectado');
} else {
  console.log('❌ Erro de conexão');
}
```

## 🔧 Integração no Componente React

Atualize `DataPreparation.tsx`:

```typescript
import { validateWithGemini } from '../../utils/geminiValidation';

const DataPreparation: React.FC = () => {
  const [useAI, setUseAI] = useState(true);
  
  const handleValidation = async () => {
    if (!uploadedData) return;
    
    setIsValidating(true);
    
    try {
      let result;
      
      if (useAI) {
        // Validação com Gemini
        result = await validateWithGemini(uploadedData);
      } else {
        // Validação local
        result = validateData(uploadedData);
      }
      
      setValidationResult(result);
    } catch (error) {
      console.error(error);
      // Fallback para validação local
      const result = validateData(uploadedData);
      setValidationResult(result);
    } finally {
      setIsValidating(false);
    }
  };
  
  // ... resto do componente
};
```

## ⚙️ Configurações Avançadas

### Ajustar Temperatura

Para validações mais consistentes:

```typescript
// Em geminiValidation.ts
generationConfig: {
  temperature: 0.1,  // Baixa = mais consistente
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
}
```

### Usar Gemini Flash (Mais Rápido)

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash' // Mais rápido, menos custo
});
```

### Usar Gemini Pro (Mais Preciso)

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro' // Mais preciso, recomendado
});
```

## 💰 Custos e Limites

### Gemini 1.5 Flash (Grátis até certo limite)

- **Grátis**: 15 requisições por minuto
- **Grátis**: 1 milhão de tokens por dia
- **Entrada**: $0.075 / 1M tokens (após limite grátis)
- **Saída**: $0.30 / 1M tokens (após limite grátis)

### Gemini 1.5 Pro

- **Grátis**: 2 requisições por minuto
- **Grátis**: 50 requisições por dia
- **Entrada**: $1.25 / 1M tokens
- **Saída**: $5.00 / 1M tokens

**Recomendação**: Use Gemini 1.5 Flash para desenvolvimento e testes

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca** commite a API Key no git
2. Use variáveis de ambiente (`.env`)
3. Limite o uso por usuário (rate limiting)
4. Monitore o uso no Google Cloud Console

### ❌ Não Faça

```typescript
// ❌ ERRADO - API Key no código
const apiKey = 'AIzaSyC...'; 

// ✅ CORRETO - Variável de ambiente
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

### Adicionar Rate Limiting

```typescript
// utils/rateLimiter.ts
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number = 10;
  private timeWindow: number = 60000; // 1 minuto
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.timeWindow
    );
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
}

export const geminiLimiter = new RateLimiter();
```

Usar no componente:

```typescript
if (!geminiLimiter.canMakeRequest()) {
  alert('Muitas requisições. Aguarde um momento.');
  return;
}

const result = await validateWithGemini(uploadedData);
```

## 🐛 Troubleshooting

### Erro: "API key not valid"

**Causa**: API Key incorreta ou inválida

**Solução**:
1. Verifique se copiou a key completa
2. Gere uma nova key no Google AI Studio
3. Atualize o `.env`

### Erro: "429 - Too Many Requests"

**Causa**: Excedeu o limite de requisições

**Solução**:
1. Aguarde alguns minutos
2. Implemente rate limiting
3. Considere upgrade para plano pago

### Erro: "Failed to fetch"

**Causa**: Problema de rede ou CORS

**Solução**:
1. Verifique sua conexão
2. Teste em outro navegador
3. Verifique se há proxy/firewall bloqueando

### Resposta em formato incorreto

**Causa**: Gemini retornou texto ao invés de JSON

**Solução**:
- A função `parseGeminiResponse()` já trata isso
- Se persistir, ajuste o prompt para ser mais específico

## 📊 Monitoramento de Uso

### Ver uso no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione seu projeto
3. Vá em "APIs & Services" → "Dashboard"
4. Veja métricas de uso do Gemini API

### Log de Requisições

```typescript
// utils/geminiValidation.ts
export async function validateWithGemini(
  uploadedData: UploadedData,
  targetPages?: string[]
): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    const result = await model.generateContent(fullPrompt);
    
    // Log success
    console.log(`✅ Validação concluída em ${Date.now() - startTime}ms`);
    
    return validationResult;
  } catch (error) {
    // Log error
    console.error(`❌ Erro após ${Date.now() - startTime}ms:`, error);
    throw error;
  }
}
```

## 🧪 Testes

### Teste Unitário

```typescript
import { testGeminiConnection } from './utils/geminiValidation';

describe('Gemini Integration', () => {
  it('should connect to Gemini', async () => {
    const isConnected = await testGeminiConnection();
    expect(isConnected).toBe(true);
  });
});
```

### Teste Manual

Execute no console do navegador:

```javascript
// Testar conexão
const result = await testGeminiConnection();
console.log('Conectado:', result);

// Testar validação
const mockData = {
  columns: [
    { name: 'Data', type_detected: 'date', sample_values: ['01/01/2025'] },
    { name: 'Valor', type_detected: 'number', sample_values: [100] }
  ],
  row_count: 10,
  file_name: 'teste.xlsx'
};

const validation = await validateWithGemini(mockData);
console.log('Resultado:', validation);
```

## 📚 Recursos Adicionais

- [Documentação Gemini API](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Preços do Gemini](https://ai.google.dev/pricing)
- [Exemplos de Código](https://github.com/google/generative-ai-js)

## ✅ Checklist de Configuração

- [ ] Criar conta no Google AI Studio
- [ ] Gerar API Key
- [ ] Instalar `@google/generative-ai`
- [ ] Criar arquivo `.env`
- [ ] Adicionar `VITE_GEMINI_API_KEY`
- [ ] Testar conexão com `testGeminiConnection()`
- [ ] Integrar no componente React
- [ ] Testar validação com arquivo real
- [ ] Configurar rate limiting
- [ ] Monitorar uso no console

## 🎯 Próximos Passos

1. ✅ Configurar Gemini
2. ⏳ Criar fallback para validação local
3. ⏳ Adicionar cache de validações
4. ⏳ Implementar feedback visual de streaming
5. ⏳ Adicionar analytics de uso

---

**Última atualização**: 03/02/2026
**Versão**: 1.0.0
