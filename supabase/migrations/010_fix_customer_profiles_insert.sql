-- Adicionar políticas de INSERT para customer_profiles
-- O problema é que não existe política para INSERT

-- Dropar políticas existentes e recriar com INSERT
DROP POLICY IF EXISTS "Allow customer read own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Allow customer update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Allow admin full access to customer_profiles" ON customer_profiles;

-- Criar políticas separadamente para cada operação

-- SELECT: Cliente pode ver seu próprio perfil, admin pode ver todos
CREATE POLICY "Allow customer read own profile" ON customer_profiles
  FOR SELECT USING (
    auth.uid() = auth_user_id OR
    (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: Qualquer usuário autenticado pode criar (para novos cadastros)
CREATE POLICY "Allow customer insert own profile" ON customer_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = auth_user_id OR
    (auth.jwt() ->> 'role') = 'admin'
  );

-- UPDATE: Cliente pode atualizar seu próprio perfil
CREATE POLICY "Allow customer update own profile" ON customer_profiles
  FOR UPDATE USING (
    auth.uid() = auth_user_id OR
    (auth.jwt() ->> 'role') = 'admin'
  );

-- DELETE: Apenas admin pode deletar
CREATE POLICY "Allow admin delete customer profile" ON customer_profiles
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'admin'
  );
