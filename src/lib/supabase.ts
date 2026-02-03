import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Cria o cliente Supabase (funciona em modo exemplo se não configurado)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
