# 🎯 Funcionalidades do Supabase - FinanceFlow

## O que é Supabase?

Supabase é um backend open-source que oferece:
- ✅ Banco de dados PostgreSQL gerenciado
- ✅ Autenticação
- ✅ Storage (armazenamento de arquivos)
- ✅ APIs em tempo real
- ✅ Segurança com RLS (Row Level Security)

---

## 📊 Funcionalidades Implementadas

### 1. **Autenticação de Usuários**
Permite que os usuários:
- ✅ Criar conta com email e senha
- ✅ Fazer login
- ✅ Fazer logout
- ✅ Recuperar senha (via email)

```typescript
const { user, signIn, signUp, signOut } = useAuth();

// Criar conta
await signUp('user@email.com', 'senha123', 'Nome');

// Fazer login
await signIn('user@email.com', 'senha123');

// Fazer logout
await signOut();
```

---

### 2. **Perfis de Usuários (Tabela: profiles)**

Cada usuário tem um perfil com:
- `id` - ID único do Supabase Auth
- `email` - Email do usuário
- `name` - Nome completo
- `avatar_url` - URL da foto de perfil
- `subscription_status` - Status: 'trial', 'active', 'expired'
- `subscription_end_date` - Data de expiração
- `created_at` - Data de criação
- `updated_at` - Data de última atualização

**Criação automática:** Quando um usuário se registra, um perfil é criado automaticamente via trigger.

---

### 3. **Armazenamento de Arquivos Excel (Tabela: user_data)**

SIM, o Supabase **salva os dados dos arquivos Excel**! 

**Como funciona:**

```typescript
import { uploadExcelFile } from '../utils/supabaseUtils';

// Ao selecionar um arquivo Excel
const handleFileUpload = async (file: File) => {
  const result = await uploadExcelFile(file);
  // Dados salvos no banco de dados!
};
```

**O que é salvo:**

```json
{
  "id": "uuid-aleatorio",
  "user_id": "id-do-usuario",
  "file_name": "dados_financeiros.xlsx",
  "file_type": "excel",
  "data": {
    // JSON com os dados da planilha
    [
      { "Descrição": "Venda", "Valor": 1000, "Data": "2024-01-01" },
      { "Descrição": "Compra", "Valor": 500, "Data": "2024-01-02" }
    ]
  },
  "created_at": "2024-01-15T10:30:00"
}
```

---

### 4. **Storage de Arquivos (Buckets)**

Dois tipos de buckets foram criados:

#### 📂 **Bucket: avatares** (PÚBLICO)
- Armazena fotos de perfil
- Qualquer pessoa pode ver
- Somente o dono pode upload/deletar
- URL pública para acessar

```typescript
// Upload de avatar
const file = new File([...], 'avatar.jpg');
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);
```

#### 📂 **Bucket: user-files** (PRIVADO)
- Armazena arquivos do usuário
- Somente o dono pode acessar
- Ideal para documentos confidenciais
- Geração de links temporários (com expiração)

```typescript
// Upload privado
const { data, error } = await supabase.storage
  .from('user-files')
  .upload(`${userId}/dados.xlsx`, file);

// Criar link temporário (válido por 1 hora)
const { data: { signedUrl } } = await supabase.storage
  .from('user-files')
  .createSignedUrl(`${userId}/dados.xlsx`, 3600);
```

---

### 5. **Segurança com RLS (Row Level Security)**

Todas as tabelas e buckets têm políticas RLS que garantem:
- ✅ Usuários só veem seus próprios dados
- ✅ Usuários não podem deletar dados de outros
- ✅ Dados privados são verdadeiramente privados

**Exemplo de política:**
```sql
-- Usuário só pode ver seus próprios dados
create policy "Users can view their own data"
  on user_data for select
  using (auth.uid() = user_id);
```

---

## 📈 Fluxo Completo: Upload de Excel

```
1. Usuário faz login
   ↓
2. Seleciona arquivo Excel no app
   ↓
3. App converte Excel em JSON usando XLSX
   ↓
4. JSON é enviado para Supabase
   ↓
5. Supabase valida RLS (é o dono?)
   ↓
6. Dados são salvos na tabela user_data
   ↓
7. App mostra confirmação
   ↓
8. Dados agora aparecem no dashboard
```

---

## 🔒 O que está PROTEGIDO

| Item | Protegido? | Quem acessa |
|------|-----------|-----------|
| Perfil do usuário | ✅ SIM | Só ele mesmo |
| Dados Excel salvos | ✅ SIM | Só o dono |
| Arquivos privados | ✅ SIM | Só o dono |
| Avatares públicos | ✅ PARCIAL | Todos veem, mas só dono edita |

---

## 💾 Como Recuperar Dados Salvos

```typescript
import { supabase } from '../lib/supabase';

// Listar todos os Excel enviados pelo usuário
const { data, error } = await supabase
  .from('user_data')
  .select('*')
  .eq('file_type', 'excel')
  .order('created_at', { ascending: false });

// Resultado:
// [
//   { id: '...', file_name: 'dados1.xlsx', data: {...}, ... },
//   { id: '...', file_name: 'dados2.xlsx', data: {...}, ... }
// ]

// Deletar um arquivo
await supabase
  .from('user_data')
  .delete()
  .eq('id', 'uuid-do-arquivo');
```

---

## 🎯 Próximas Funcionalidades Possíveis

- [ ] Sincronização em tempo real com WebSockets
- [ ] Versioning de arquivos Excel
- [ ] Export/Import de dados
- [ ] Compartilhamento de dados entre usuários
- [ ] Relatórios automáticos gerados do Excel
- [ ] Backup automático
- [ ] API para terceiros

---

## 📚 Resumo

O Supabase no FinanceFlow oferece:

1. **Autenticação segura** - Login/registro
2. **Armazenamento de dados** - Perfis, dados Excel
3. **Armazenamento de arquivos** - Avatares, documentos
4. **Segurança total** - RLS, criptografia
5. **Escalabilidade** - Cresce com o app

✅ **SIM, os Excel dos usuários são salvos** no banco de dados (tabela `user_data`) de forma segura e privada!
