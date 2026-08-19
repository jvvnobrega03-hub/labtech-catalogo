# Como Configurar o Banco de Dados Supabase

## Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em **"New project"**
3. Preencha os dados:
   - **Organization**: selecione ou crie uma
   - **Name**: `labtech-catalogo`
   - **Database Password**: crie uma senha forte (guarde essa senha!)
   - **Region**: selecione a mais próxima de você
4. Clique em **"Create new project"**
5. Aguarde alguns minutos até estar pronto

---

## Passo 2: Executar o SQL

1. No painel do Supabase, clique em **"SQL Editor"** no menu à esquerda
2. Clique em **"New query"**
3. Abra o arquivo: `supabase/migrations/sql-labtech-completo.sql` no seu computador
4. Copie todo o conteúdo (Ctrl+A, Ctrl+C)
5. Cole no SQL Editor do Supabase (Ctrl+V)
6. Clique em **"Run"** (ou pressione Ctrl+Enter)

Se der erro, verifique se o SQL está completo.

---

## Passo 3: Pegar as Credenciais

1. No Supabase, clique em **"Settings"** (ícone de engrenagem) no menu à esquerda
2. Clique em **"API"**
3. Copie:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** (chave anônima)

---

## Passo 4: Configurar na Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto **labtech-catalogo**
3. Clique em **"Settings"**
4. No menu左侧, clique em **"Environment Variables"**
5. No Supabase:
   - Clique em **Settings** (ícone de engrenagem)
   - Clique em **API**
   - Copie a **Project URL** (algo como https://xxxxxx.supabase.co)
   - Copie a **anon public** (chiave grande que começa com "eyJ...")

   Na Vercel:
   - Clique em **Settings** do projeto
   - Clique em **Environment Variables**
   - Clique em **Add New**
   - Em "Name" digite: `NEXT_PUBLIC_SUPABASE_URL`
   - Em "Value" cole a URL do Supabase
   - Clique em **Add**
   - Repita para `NEXT_PUBLIC_SUPABASE_ANON_KEY` com a chave anon

6. Clique em **"Save"**
7. O deploy vai reiniciar automaticamente

---

## Passo 5: Criar Usuário Admin

1. No Supabase, clique em **"Authentication"** no menu à esquerda
2. Clique em **"Users"**
3. Clique em **"Add user"**
4. Preencha:
   - **Email**: seu email
   - **Password**: uma senha
   - **Confirm password**: mesma senha
5. Clique em **"Create user"**

Agora você pode fazer login em:
- **URL**: https://labtech-catalogo.vercel.app/admin/login
- **Email**: o email que você criou
- **Senha**: a senha que você definiu

---

## Pronto! ✅

O painel admin estará funcionando com:
- Gestão de produtos
- Gestão de categorias
- Gestão de segmentos
- Gestão de marcas
- Gestão de aplicações
- Controle de estoque
- Upload de imagens
