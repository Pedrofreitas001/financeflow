// Script para debugar o plano do usuário via API do Supabase
// Use: npm run dev (em outro terminal)
// Depois: node debug-plan.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Ler .env manualmente
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Conectando ao Supabase...');
console.log('URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('Key:', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPlan() {
    try {
        console.log('\n=== Buscando todas as subscriptions ===');
        const { data: subs, error: subsError } = await supabase
            .from('subscriptions')
            .select('user_id, plan, status, created_at, expires_at');

        if (subsError) {
            console.error('Erro ao buscar subscriptions:', subsError);
            return;
        }

        console.log(`Total de subscriptions: ${subs?.length || 0}`);
        subs?.forEach((sub, i) => {
            console.log(`\n${i + 1}. User ID: ${sub.user_id}`);
            console.log(`   Plan: ${sub.plan}`);
            console.log(`   Status: ${sub.status}`);
            console.log(`   Created: ${sub.created_at}`);
            console.log(`   Expires: ${sub.expires_at || 'Nunca'}`);
        });

        console.log('\n=== Buscando usuários no auth ===');
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            console.error('Erro ao buscar usuários:', usersError);
            return;
        }

        console.log(`Total de usuários: ${users?.length || 0}`);
        users?.slice(0, 5).forEach((user, i) => {
            console.log(`${i + 1}. ${user.email} (ID: ${user.id})`);
        });

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

debugPlan();
