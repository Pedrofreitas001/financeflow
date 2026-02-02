# FinanceFlow SaaS - Dashboard Contábil Profissional

## 🚀 Visão Geral

O FinanceFlow é um SaaS de dashboard contábil profissional que permite empresas visualizarem e analisarem seus dados financeiros de forma inteligente e automatizada.

### Estrutura do Projeto

```
financeflow-saas/
├── landing/                 # Landing Page do SaaS
│   ├── components/         # Componentes da landing (Navbar, Footer, LazyImage)
│   ├── pages/             # Páginas (Home, Login)
│   └── LandingApp.tsx     # App da landing page
├── components/            # Componentes do Dashboard
├── context/              # Contextos do Dashboard
├── dados/                # Dados de exemplo
├── App.tsx               # Roteador principal
├── DashboardApp.tsx      # Aplicação do Dashboard
└── index.tsx             # Entry point
```

## 📋 Funcionalidades

### Landing Page
- ✅ Homepage moderna e profissional
- ✅ Seção de recursos premium
- ✅ Galeria de dashboards
- ✅ Plano de preços (R$ 59,90/mês)
- ✅ Página de login/cadastro
- ✅ Design responsivo com cores azuis premium

### Dashboard (Área Logada)
- ✅ Dashboards interativos e personalizáveis
- ✅ Upload seguro de arquivos Excel
- ✅ Análise DRE completa
- ✅ Balancete patrimonial
- ✅ Cash Flow
- ✅ Indicadores financeiros
- ✅ Orçamento
- ✅ Insights com IA
- ✅ Exportação de relatórios em PDF
- ✅ Múltiplos temas (claro/escuro)

## 🎨 Design

### Paleta de Cores
- **Primária**: Azul (#3B82F6 - blue-600)
- **Secundária**: Indigo (#4F46E5)
- **Accent**: Purple, Pink, Cyan
- **Background**: Gradientes de Slate e Blue

### Tipografia
- **Títulos**: Font-bold, tamanhos responsivos
- **Corpo**: Leading-relaxed para legibilidade
- **Ícones**: Material Symbols Outlined

## 🛣️ Rotas

### Landing Page
- `/` - Home page
- `/login` - Login/Cadastro

### Dashboard (Área Logada)
- `/dashboard` - Dashboard principal

## 🔐 Autenticação (A Implementar)

O projeto está preparado para integração com Supabase:
1. Crie um projeto no Supabase
2. Configure as variáveis de ambiente
3. Implemente a autenticação no componente Login
4. Proteja as rotas do dashboard

### Variáveis de Ambiente Necessárias
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🎯 Plano de Desenvolvimento

### Fase 1: Landing Page ✅ (Concluída)
- [x] Estrutura básica
- [x] Componentes principais
- [x] Design responsivo
- [x] Página de login

### Fase 2: Autenticação (Próximo)
- [ ] Integração com Supabase
- [ ] Sistema de login/registro
- [ ] Proteção de rotas
- [ ] Gerenciamento de sessão

### Fase 3: Upload de Dados
- [ ] Interface de upload de Excel
- [ ] Validação de dados
- [ ] Processamento e armazenamento
- [ ] Feedback visual

### Fase 4: Integração IA
- [ ] Chat com IA para insights
- [ ] Análises automáticas
- [ ] Sugestões inteligentes
- [ ] Exportação de relatórios

### Fase 5: Pagamentos
- [ ] Integração com Stripe/Mercado Pago
- [ ] Gerenciamento de assinaturas
- [ ] Dashboard de faturamento
- [ ] Planos e upgrades

## 💰 Modelo de Negócio

**Preço**: R$ 59,90/mês
**Trial**: 7 dias grátis
**Pagamento**: Recorrente mensal
**Cancelamento**: A qualquer momento

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Roteamento
- **Recharts** - Gráficos
- **Tailwind CSS** - Estilização
- **Supabase** - Backend (a integrar)
- **Google Gemini** - IA

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Wide Desktop (1280px+)

## 🚀 Deploy

### Recomendações
- **Vercel** (recomendado para Next.js/React)
- **Netlify**
- **AWS Amplify**
- **DigitalOcean App Platform**

### Configuração Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 📄 Licença

Proprietary - Todos os direitos reservados

## 👥 Suporte

Para dúvidas e suporte:
- Email: suporte@financeflow.com
- WhatsApp: (11) 99999-9999

---

**Desenvolvido com ❤️ para revolucionar a gestão contábil**
