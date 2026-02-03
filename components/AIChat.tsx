import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useFinance } from '../context/FinanceContext';
import { formatBRL } from '../utils/financeUtils';
import { ChatMessage } from '../types';
import PremiumModal from './PremiumModal';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: '👋 Olá! Sou seu assistente financeiro.\n\nPergunte-me sobre:\n• Margens e lucratividade\n• Maiores despesas\n• Onde cortar custos\n• Comparações de períodos\n\nComo posso ajudar?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const isPremium = false; // Mock - substituir por lógica real de assinatura
  const FREE_MESSAGE_LIMIT = 3; // Limite de mensagens gratuitas
  const scrollRef = useRef<HTMLDivElement>(null);
  const { kpis, agregadoMensal, agregadoCategoria, filtros } = useFinance();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const getSystemContext = () => {
    const dataSummary = {
      empresa: filtros.empresa,
      indicadores: {
        fatLiquido: formatBRL(kpis.faturamentoLiquido),
        margem: `${kpis.margemContribuicaoPerc.toFixed(1)}%`,
        ebitda: formatBRL(kpis.resultado),
        lucratividade: `${kpis.margemLiquida.toFixed(1)}%`
      },
      topDespesas: agregadoCategoria.slice(0, 3).map(c => `${c.name}: ${c.percentage}%`)
    };

    return `Você é o assistente financeiro da FinanceFlow, especializado em análise de dados empresariais.

DADOS DA EMPRESA:
${JSON.stringify(dataSummary, null, 2)}

SEU PAPEL:
- Responder perguntas APENAS sobre os dados financeiros desta empresa
- Direcionar o usuário para as funcionalidades do dashboard quando apropriado
- Ser DIRETO e OBJETIVO (máximo 3-4 linhas por resposta)
- Focar em INSIGHTS ACIONÁVEIS

O QUE VOCÊ PODE FAZER:
✓ Analisar margens e lucratividade
✓ Identificar maiores despesas
✓ Sugerir onde cortar custos
✓ Comparar períodos
✓ Explicar indicadores financeiros
✓ Recomendar relatórios específicos do dashboard

O QUE VOCÊ NÃO PODE FAZER:
✗ Responder perguntas genéricas sobre finanças
✗ Dar conselhos sobre empresas que não sejam esta
✗ Criar textos longos e densos
✗ Divagar sem base nos dados

REGRAS DE RESPOSTA:
1. Máximo 3-4 linhas
2. Use bullet points quando listar itens
3. Cite números dos dados reais
4. Sugira onde no dashboard ver mais detalhes (ex: "Veja mais em Dashboard > Despesas")
5. Se a pergunta não for sobre estes dados, redirecione educadamente

EXEMPLO DE BOA RESPOSTA:
"Sua maior despesa é Marketing (35%). Recomendo:
• Revisar contratos de SaaS
• Negociar descontos em volume
• Veja detalhes em: Dashboard > Análise de Despesas"`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Verificar limite de mensagens gratuitas
    if (!isPremium && messageCount >= FREE_MESSAGE_LIMIT) {
      setShowPremiumModal(true);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const prompt = input;
    setInput('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('API Key não configurada');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      const fullPrompt = `${getSystemContext()}

PERGUNTA DO USUÁRIO:
${prompt}

INSTRUÇÕES:
- Responda com base APENAS nos dados fornecidos
- Use formatação Markdown para melhor leitura
- Seja específico com números e percentuais
- Mantenha tom executivo e profissional
- Se não tiver dados suficientes, seja honesto sobre isso`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, {
        role: 'model',
        text: text || "Não foi possível gerar uma análise no momento.",
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Erro no chat AI:', err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Erro na conexão com a IA. Verifique se a API Key está configurada corretamente.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 ai-glow group"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">insights</span>
      </button>

      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-background-dark border-l border-border-dark z-[60] transform transition-transform duration-500 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border-dark flex items-center justify-between bg-surface-dark/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-tight">FinanceFlow Strategic AI</h4>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Active Insight Engine</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${m.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-surface-dark border border-border-dark text-gray-200 rounded-tl-none'
                  }`}>
                  <div className="prose prose-invert prose-xs">
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-dark border border-border-dark rounded-2xl rounded-tl-none p-4">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border-dark bg-surface-dark/30">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Pergunte sobre rentabilidade ou custos..."
                className="w-full bg-background-dark border border-border-dark rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              <button
                onClick={sendMessage}
                className="absolute right-2 top-1.5 w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
            {!isPremium && (
              <p className="text-[10px] text-center mt-2 text-amber-400">
                {messageCount}/{FREE_MESSAGE_LIMIT} perguntas gratuitas
              </p>
            )}
            <p className="text-[9px] text-text-muted text-center mt-2 uppercase tracking-[0.2em] font-bold opacity-50">Powered by Gemini Flash 2</p>
          </div>
        </div>
      </div>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] animate-in fade-in duration-300" />
      )}

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Chat com IA Ilimitado"
        description="Faça perguntas ilimitadas sobre suas finanças e receba análises personalizadas em tempo real."
      />
    </>
  );
};

export default AIChat;
