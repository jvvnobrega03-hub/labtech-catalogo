-- Sistema de clientes LABTECH

-- Tabela de perfis de clientes
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,

  -- Dados do representante
  representative_name VARCHAR(255) NOT NULL,
  "position" VARCHAR(100) NOT NULL,
  document VARCHAR(20) UNIQUE NOT NULL,
  document_type VARCHAR(10) NOT NULL CHECK (document_type IN ('CPF', 'CNPJ')),

  -- Dados da empresa
  company_name VARCHAR(255) NOT NULL,

  -- Endereço
  postal_code VARCHAR(10),
  street VARCHAR(255),
  "number" VARCHAR(20),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  "state" VARCHAR(2),
  complement VARCHAR(255),
  reference_point VARCHAR(255),

  -- Contato
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),

  -- Auditoria
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID,
  rejection_reason TEXT,
  suspended_at TIMESTAMPTZ,
  suspended_by UUID,
  suspension_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_document ON customer_profiles(document);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_status ON customer_profiles(status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_created_at ON customer_profiles(created_at DESC);

-- Row Level Security
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Qualquer um pode se cadastrar (inserir)
DROP POLICY IF EXISTS "Allow public insert on customer_profiles" ON customer_profiles;
CREATE POLICY "Allow public insert on customer_profiles" ON customer_profiles
  FOR INSERT TO anon WITH CHECK (true);

-- Clientes podem ver apenas seus próprios dados
DROP POLICY IF EXISTS "Allow customer read own profile" ON customer_profiles;
CREATE POLICY "Allow customer read own profile" ON customer_profiles
  FOR SELECT USING (
    auth.uid() = auth_user_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Apenas o próprio cliente pode atualizar seus dados (exceto campos administrativos)
DROP POLICY IF EXISTS "Allow customer update own profile" ON customer_profiles;
CREATE POLICY "Allow customer update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Administradores podem fazer tudo
DROP POLICY IF EXISTS "Allow admin full access to customer_profiles" ON customer_profiles;
CREATE POLICY "Allow admin full access to customer_profiles" ON customer_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Função para buscar perfil do cliente
CREATE OR REPLACE FUNCTION get_customer_profile()
RETURNS TABLE (
  id UUID,
  representative_name VARCHAR,
  "position" VARCHAR,
  document VARCHAR,
  document_type VARCHAR,
  company_name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  postal_code VARCHAR,
  street VARCHAR,
  "number" VARCHAR,
  neighborhood VARCHAR,
  city VARCHAR,
  "state" VARCHAR,
  complement VARCHAR,
  reference_point VARCHAR,
  status VARCHAR,
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.representative_name,
    cp."position",
    cp.document,
    cp.document_type,
    cp.company_name,
    cp.phone,
    cp.email,
    cp.postal_code,
    cp.street,
    cp."number",
    cp.neighborhood,
    cp.city,
    cp."state",
    cp.complement,
    cp.reference_point,
    cp.status,
    cp.created_at,
    cp.approved_at
  FROM customer_profiles cp
  WHERE cp.auth_user_id = auth.uid();
END;
$$;
