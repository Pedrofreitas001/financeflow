# Guia de Integração com Supabase - FinanceFlow

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Credenciais do projeto (URL e Anon Key)

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Criar Cliente Supabase

Crie o arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. Criar Contexto de Autenticação

Crie o arquivo `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. Atualizar Componente de Login

Atualize `landing/pages/Login.tsx`:

```typescript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(formData.email, formData.password);
                navigate('/dashboard');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('As senhas não coincidem');
                }
                await signUp(formData.email, formData.password, formData.name);
                alert('Conta criada! Verifique seu email para confirmar.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao processar solicitação');
        } finally {
            setLoading(false);
        }
    };

    // ... resto do componente
};
```

### 6. Proteger Rotas

Crie o componente `ProtectedRoute.tsx`:

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

### 7. Atualizar App.tsx

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './landing/pages/Home';
import Login from './landing/pages/Login';
import DashboardApp from './DashboardApp';
import ProtectedRoute from './ProtectedRoute';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <DashboardApp />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: profiles

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  avatar_url text,
  subscription_status text default 'trial',
  subscription_end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
```

### Tabela: user_data

```sql
create table user_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_type text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_data enable row level security;

-- Policies
create policy "Users can view their own data"
  on user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own data"
  on user_data for delete
  using (auth.uid() = user_id);
```

### Trigger para criar perfil automaticamente

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 🔒 Storage para Arquivos

### Criar Bucket

```sql
-- Criar bucket público para avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Criar bucket privado para dados do usuário
insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', false);

-- Policies para avatares
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Policies para arquivos de usuário
create policy "Users can access their own files"
  on storage.objects for select
  using (bucket_id = 'user-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own files"
  on storage.objects for insert
  with check (bucket_id = 'user-files' and auth.uid()::text = (storage.foldername(name))[1]);
```

## 📤 Upload de Arquivos Excel

Exemplo de função para upload:

```typescript
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export const uploadExcelFile = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Ler arquivo Excel
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  // Salvar dados no Supabase
  const { data, error } = await supabase
    .from('user_data')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_type: 'excel',
      data: jsonData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

## 🎉 Pronto!

Agora você tem:
- ✅ Autenticação completa com Supabase
- ✅ Proteção de rotas
- ✅ Banco de dados estruturado
- ✅ Upload de arquivos
- ✅ Sistema de perfis

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Auth Helpers](https://supabase.com/docs/guides/auth)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
