-- ============================================
-- FinanceFlow - Supabase Setup SQL
-- Execute este script completo no Supabase
-- ============================================

-- ============================================
-- 1. CRIAR TABELA PROFILES
-- ============================================
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

-- Comentário da tabela
comment on table profiles is 'Perfis de usuários e informações de assinatura';

-- ============================================
-- 2. HABILITAR RLS NA TABELA PROFILES
-- ============================================
alter table profiles enable row level security;

-- Políticas de acesso para PROFILES
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- 3. CRIAR TABELA USER_DATA
-- ============================================
create table user_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_type text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comentário da tabela
comment on table user_data is 'Dados de arquivos enviados pelos usuários (Excel, CSV, etc)';

-- ============================================
-- 4. HABILITAR RLS NA TABELA USER_DATA
-- ============================================
alter table user_data enable row level security;

-- Políticas de acesso para USER_DATA
create policy "Users can view their own data"
  on user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on user_data for update
  using (auth.uid() = user_id);

create policy "Users can delete their own data"
  on user_data for delete
  using (auth.uid() = user_id);

-- ============================================
-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================
create index idx_user_data_user_id on user_data(user_id);
create index idx_user_data_created_at on user_data(created_at);
create index idx_profiles_email on profiles(email);

-- ============================================
-- 6. CRIAR FUNÇÃO PARA AUTO-CRIAR PERFIL
-- ============================================
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
$$ language plpgsql security definer set search_path = public;

-- ============================================
-- 7. CRIAR TRIGGER PARA NOVO USUÁRIO
-- ============================================
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 8. CRIAR STORAGE BUCKETS
-- ============================================

-- Bucket para avatares (público)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- Bucket para arquivos de usuário (privado)
insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', false)
on conflict do nothing;

-- ============================================
-- 9. POLÍTICAS PARA STORAGE - AVATARES
-- ============================================

-- Permitir que qualquer pessoa veja avatares
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Permitir upload de avatar pelo próprio usuário
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir deletar próprio avatar
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 10. POLÍTICAS PARA STORAGE - ARQUIVOS DO USUÁRIO
-- ============================================

-- Permitir ver próprios arquivos
create policy "Users can access their own files"
  on storage.objects for select
  using (
    bucket_id = 'user-files' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir upload de arquivos
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (
    bucket_id = 'user-files' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir deletar próprios arquivos
create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'user-files' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 11. CRIAR TABELA AUDIT LOG (OPCIONAL)
-- ============================================
create table audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table audit_log enable row level security;

create policy "Users can view their own audit logs"
  on audit_log for select
  using (auth.uid() = user_id);

-- ============================================
-- 12. CRIAR FUNÇÃO DE ATUALIZAÇÃO (updated_at)
-- ============================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at na tabela profiles
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute procedure public.update_updated_at_column();

-- ============================================
-- SETUP COMPLETO!
-- ============================================
-- Próximas etapas:
-- 1. Instalar dependência: npm install @supabase/supabase-js
-- 2. Criar arquivo .env com suas credenciais do Supabase
-- 3. Os arquivos TypeScript já estão criados em:
--    - src/lib/supabase.ts
--    - src/context/AuthContext.tsx
--    - src/ProtectedRoute.tsx
--    - src/utils/supabaseUtils.ts
-- ============================================
