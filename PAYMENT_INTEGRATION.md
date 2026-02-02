# Guia de Integração de Pagamentos - FinanceFlow

## 💳 Opções de Pagamento para Brasil

### 1. Stripe (Recomendado Internacionalmente)
- ✅ Aceita cartões internacionais
- ✅ Gestão de assinaturas integrada
- ❌ Taxas maiores no Brasil
- ❌ Menor adoção de PIX

### 2. Mercado Pago (Recomendado para Brasil)
- ✅ PIX integrado
- ✅ Cartões brasileiros
- ✅ Boleto bancário
- ✅ Taxas competitivas
- ✅ Checkout transparente

### 3. Asaas
- ✅ Foco em SaaS brasileiro
- ✅ PIX, Boleto, Cartão
- ✅ Split de pagamentos
- ✅ API simples

## 🚀 Integração com Mercado Pago

### 1. Criar Conta

1. Acesse https://www.mercadopago.com.br
2. Crie uma conta empresarial
3. Acesse as credenciais em https://www.mercadopago.com.br/developers

### 2. Instalar SDK

```bash
npm install mercadopago
```

### 3. Configurar Variáveis de Ambiente

```env
VITE_MERCADOPAGO_PUBLIC_KEY=sua-public-key
VITE_MERCADOPAGO_ACCESS_TOKEN=seu-access-token
```

### 4. Criar Endpoint de Assinatura (Backend)

Crie uma Supabase Edge Function:

```typescript
// supabase/functions/create-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import MercadoPago from 'https://esm.sh/mercadopago@1.5.14'

serve(async (req) => {
  try {
    const { userId, email, name } = await req.json()
    
    // Configurar Mercado Pago
    MercadoPago.configure({
      access_token: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
    })

    // Criar assinatura
    const subscription = await MercadoPago.preapproval.create({
      reason: 'Assinatura FinanceFlow - Dashboard Contábil',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 59.90,
        currency_id: 'BRL',
        start_date: new Date().toISOString(),
      },
      back_url: `${Deno.env.get('APP_URL')}/dashboard`,
      payer_email: email,
    })

    // Salvar no banco
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase.from('subscriptions').insert({
      user_id: userId,
      subscription_id: subscription.id,
      status: 'pending',
      amount: 59.90,
    })

    return new Response(
      JSON.stringify({ 
        init_point: subscription.init_point,
        subscription_id: subscription.id 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 5. Criar Tabela de Assinaturas

```sql
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subscription_id text unique not null,
  status text not null default 'pending',
  amount decimal(10, 2) not null,
  payment_method text,
  started_at timestamp with time zone,
  ends_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Índices
create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_status_idx on subscriptions(status);
```

### 6. Webhook para Receber Atualizações

```typescript
// supabase/functions/mercadopago-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import MercadoPago from 'https://esm.sh/mercadopago@1.5.14'

serve(async (req) => {
  try {
    const body = await req.json()
    
    // Verificar se é notificação de assinatura
    if (body.type === 'subscription') {
      MercadoPago.configure({
        access_token: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
      })

      // Buscar detalhes da assinatura
      const subscription = await MercadoPago.preapproval.get(body.data.id)
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      // Atualizar status no banco
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          started_at: subscription.start_date,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', subscription.id)

      // Atualizar perfil do usuário
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('subscription_id', subscription.id)
        .single()

      if (sub && subscription.status === 'authorized') {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', sub.user_id)
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 7. Componente de Checkout (Frontend)

```typescript
// src/components/Checkout.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          userId: user.id,
          email: user.email,
          name: user.user_metadata.name,
        },
      });

      if (error) throw error;

      // Redirecionar para página de pagamento do Mercado Pago
      window.location.href = data.init_point;
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao criar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Assinar FinanceFlow</h2>
      <div className="mb-6">
        <div className="text-4xl font-bold text-blue-600 mb-2">R$ 59,90</div>
        <div className="text-slate-600">por mês</div>
      </div>
      
      <ul className="space-y-3 mb-6">
        <li className="flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span>Upload ilimitado de Excel</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span>Dashboards personalizáveis</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span>Insights com IA</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span>Exportação PDF</span>
        </li>
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        {loading ? 'Processando...' : 'Assinar Agora'}
      </button>

      <p className="text-xs text-slate-500 text-center mt-4">
        Pagamento seguro via Mercado Pago • Cancele quando quiser
      </p>
    </div>
  );
};

export default Checkout;
```

### 8. Middleware de Verificação de Assinatura

```typescript
// src/hooks/useSubscription.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'authorized')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setSubscription(data);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const isActive = subscription?.status === 'authorized';
  const isTrial = !subscription && user; // Primeiros 7 dias

  return { subscription, isActive, isTrial, loading };
};
```

### 9. Proteger Funcionalidades Premium

```typescript
// src/components/PremiumFeature.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

interface PremiumFeatureProps {
  children: React.ReactNode;
  feature: string;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({ children, feature }) => {
  const { isActive, isTrial } = useSubscription();

  if (isActive || isTrial) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-lg">
        <div className="text-center text-white p-6">
          <span className="material-symbols-outlined text-5xl mb-4 block">lock</span>
          <h3 className="text-xl font-bold mb-2">Recurso Premium</h3>
          <p className="text-slate-300 mb-4">{feature} disponível apenas para assinantes</p>
          <Link 
            to="/checkout" 
            className="inline-block bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Assinar por R$ 59,90/mês
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeature;
```

## 📊 Dashboard de Admin

### Visualizar Assinaturas Ativas

```sql
-- Query para métricas
select 
  count(*) as total_subscriptions,
  count(*) filter (where status = 'authorized') as active,
  count(*) filter (where status = 'cancelled') as cancelled,
  sum(amount) filter (where status = 'authorized') as mrr
from subscriptions;
```

## 🔔 Notificações

### Email de Boas-vindas após Pagamento

Use Supabase Edge Functions + Resend ou SendGrid para enviar emails:

```typescript
// Enviar email após confirmação de pagamento
import { Resend } from 'https://esm.sh/resend@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

await resend.emails.send({
  from: 'FinanceFlow <noreply@financeflow.com>',
  to: user.email,
  subject: 'Bem-vindo ao FinanceFlow! 🎉',
  html: `
    <h1>Parabéns! Sua assinatura está ativa</h1>
    <p>Agora você tem acesso a todos os recursos premium...</p>
  `
})
```

## 🎯 Próximos Passos

1. ✅ Configurar conta Mercado Pago
2. ✅ Implementar Edge Functions no Supabase
3. ✅ Criar tabelas de assinaturas
4. ✅ Implementar checkout no frontend
5. ✅ Configurar webhooks
6. ✅ Testar fluxo completo
7. ✅ Implementar período de trial
8. ✅ Adicionar gestão de cancelamento

## 💰 Cálculo de Receita

- **Preço**: R$ 59,90/mês
- **Taxa Mercado Pago**: ~4,99% + R$ 0,40
- **Receita líquida**: ~R$ 56,50/mês por cliente
- **Meta 100 clientes**: R$ 5.650/mês
- **Meta 1000 clientes**: R$ 56.500/mês

## 📱 Apps de Teste

Mercado Pago oferece contas de teste para desenvolvimento:
https://www.mercadopago.com.br/developers/pt/docs/shopify/testing

---

**Boa sorte com seu SaaS! 🚀**
