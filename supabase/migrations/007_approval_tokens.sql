-- Sistema de tokens de aprovação por e-mail

-- Tabela de tokens de aprovação
CREATE TABLE IF NOT EXISTS approval_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVE', 'REJECT')),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT idx_approval_tokens_customer ON approval_tokens(customer_id);
CREATE INDEX IF NOT idx_approval_tokens_token_hash ON approval_tokens(token_hash);
CREATE INDEX IF NOT idx_approval_tokens_expires ON approval_tokens(expires_at) WHERE used_at IS NULL;

-- Adicionar campos de notificação na tabela de clientes
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS approval_notification_sent_at TIMESTAMPTZ;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS approval_notification_error TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS approval_notification_attempts INT DEFAULT 0;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS approval_method VARCHAR(20);

-- Função para gerar token seguro
CREATE OR REPLACE FUNCTION generate_approval_token()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  token TEXT;
BEGIN
  -- Gerar token criptograficamente seguro
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$;

-- Função para criar token de aprovação
CREATE OR REPLACE FUNCTION create_approval_token(
  p_customer_id UUID,
  p_action VARCHAR
)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  token TEXT;
  token_hash TEXT;
BEGIN
  -- Gerar token
  token := generate_approval_token();

  -- Criar hash do token para armazenamento seguro
  token_hash := encode(digest(token, 'sha256'), 'hex');

  -- Inserir token
  INSERT INTO approval_tokens (customer_id, token_hash, action, expires_at)
  VALUES (p_customer_id, token_hash, p_action, NOW() + INTERVAL '7 days')
  ON CONFLICT (token_hash) DO NOTHING;

  RETURN token;
END;
$$;

-- Função para validar token
CREATE OR REPLACE FUNCTION validate_approval_token(
  p_token TEXT,
  p_action VARCHAR
)
RETURNS TABLE (
  valid BOOLEAN,
  customer_id UUID,
  token_id UUID
) LANGUAGE plpgsql AS $$
DECLARE
  token_hash TEXT;
BEGIN
  token_hash := encode(digest(p_token, 'sha256'), 'hex');

  RETURN QUERY
  SELECT
    CASE
      WHEN at.id IS NOT NULL
        AND at.used_at IS NULL
        AND at.expires_at > NOW()
        AND at.action = p_action
      THEN TRUE
      ELSE FALSE
    END,
    at.customer_id,
    at.id
  FROM approval_tokens at
  WHERE at.token_hash = token_hash;
END;
$$;

-- Função para marcar token como usado
CREATE OR REPLACE FUNCTION mark_token_used(p_token_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE approval_tokens
  SET used_at = NOW()
  WHERE id = p_token_id;
END;
$$;

-- Função centralizada para aprobar cliente (usada tanto pelo admin quanto pelo token)
CREATE OR REPLACE FUNCTION approve_customer(
  p_customer_id UUID,
  p_method VARCHAR DEFAULT 'EMAIL'
)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  UPDATE customer_profiles
  SET
    status = 'APPROVED',
    approved_at = NOW(),
    approved_by = NULL,  -- Via token, não há usuário admin logado
    approval_method = p_method,
    updated_at = NOW()
  WHERE id = p_customer_id;

  RETURN FOUND;
END;
$$;

-- Função centralizada para rejeitar cliente
CREATE OR REPLACE FUNCTION reject_customer(
  p_customer_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_method VARCHAR DEFAULT 'EMAIL'
)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  UPDATE customer_profiles
  SET
    status = 'REJECTED',
    rejected_at = NOW(),
    rejected_by = NULL,
    rejection_reason = p_reason,
    approval_method = p_method,
    updated_at = NOW()
  WHERE id = p_customer_id;

  RETURN FOUND;
END;
$$;
