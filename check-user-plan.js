// Script temporário para verificar plano do usuário
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Ler .env manualmente
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserPlan() {
    try {
        // Pegar usuário autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.log('❌ Nenhum usuário autenticado');
            console.log('Você precisa estar logado para verificar o plano');
            return;
        }

        console.log('✅ Usuário autenticado:', user.email);
        console.log('User ID:', user.id);

        // Buscar subscription
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (subError) {
            if (subError.code === 'PGRST116') {
                console.log('\n⚠️  Nenhuma subscription encontrada - Plano: FREE');
                console.log('\n🔧 Para configurar como Diamond, execute:');
                console.log(`INSERT INTO subscriptions (user_id, plan, status) VALUES ('${user.id}', 'diamond', 'active');`);
            } else {
                console.error('❌ Erro ao buscar subscription:', subError);
            }
            return;
        }

        console.log('\n📊 SUBSCRIPTION ATUAL:');
        console.log('  Plano:', subscription.plan.toUpperCase());
        console.log('  Status:', subscription.status);
        console.log('  Criado em:', subscription.created_at);

        if (subscription.plan === 'diamond') {
            console.log('\n💎 ACESSO DIAMOND CONFIRMADO! Você tem acesso total a:');
            console.log('  ✅ Gerar Insights com IA');
            console.log('  ✅ Exportar PDF');
            console.log('  ✅ Todas as funcionalidades premium');
        } else if (subscription.plan === 'premium') {
            console.log('\n⭐ ACESSO PREMIUM CONFIRMADO! Você tem acesso a:');
            console.log('  ✅ Gerar Insights com IA');
            console.log('  ✅ Exportar PDF');
            console.log('  ✅ Todas as funcionalidades premium');
        } else {
            console.log('\n⚠️  Plano FREE - Funcionalidades limitadas');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

checkUserPlan().then(() => process.exit(0));
