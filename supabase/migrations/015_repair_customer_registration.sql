-- Reparo idempotente do fluxo de cadastro e aprovação por e-mail.
-- Pode ser executado com segurança em projetos onde as migrações antigas
-- foram aplicadas parcialmente.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  representative_name varchar(255) NOT NULL,
  "position" varchar(100) NOT NULL,
  document varchar(20) UNIQUE NOT NULL,
  document_type varchar(10) NOT NULL CHECK (document_type IN ('CPF', 'CNPJ')),
  company_name varchar(255) NOT NULL,
  postal_code varchar(10),
  street varchar(255),
  "number" varchar(20),
  neighborhood varchar(100),
  city varchar(100),
  "state" varchar(2),
  complement varchar(255),
  reference_point varchar(255),
  phone varchar(20) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  approved_at timestamptz,
  approved_by uuid,
  rejected_at timestamptz,
  rejected_by uuid,
  rejection_reason text,
  suspended_at timestamptz,
  suspended_by uuid,
  suspension_reason text,
  approval_notification_sent_at timestamptz,
  approval_notification_error text,
  approval_notification_attempts integer DEFAULT 0,
  approval_method varchar(20),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS representative_name varchar(255);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS "position" varchar(100);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS document varchar(20);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS document_type varchar(10);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS company_name varchar(255);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS postal_code varchar(10);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS street varchar(255);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS "number" varchar(20);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS neighborhood varchar(100);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS city varchar(100);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS "state" varchar(2);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS complement varchar(255);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS reference_point varchar(255);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS phone varchar(20);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS email varchar(255);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'PENDING';
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS approved_by uuid;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS rejected_at timestamptz;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS rejected_by uuid;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS suspended_at timestamptz;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS suspended_by uuid;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS suspension_reason text;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS approval_notification_sent_at timestamptz;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS approval_notification_error text;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS approval_notification_attempts integer DEFAULT 0;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS approval_method varchar(20);
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS customer_profiles_auth_user_id_key ON public.customer_profiles(auth_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS customer_profiles_document_key ON public.customer_profiles(document);
CREATE UNIQUE INDEX IF NOT EXISTS customer_profiles_email_key ON public.customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_status ON public.customer_profiles(status);

CREATE TABLE IF NOT EXISTS public.approval_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  token_hash varchar(255) NOT NULL UNIQUE,
  action varchar(20) NOT NULL CHECK (action IN ('APPROVE', 'REJECT')),
  used_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.approval_tokens ADD COLUMN IF NOT EXISTS customer_id uuid;
ALTER TABLE public.approval_tokens ADD COLUMN IF NOT EXISTS token_hash varchar(255);
ALTER TABLE public.approval_tokens ADD COLUMN IF NOT EXISTS action varchar(20);
ALTER TABLE public.approval_tokens ADD COLUMN IF NOT EXISTS used_at timestamptz;
ALTER TABLE public.approval_tokens ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.approval_tokens ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS approval_tokens_token_hash_key ON public.approval_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_approval_tokens_customer ON public.approval_tokens(customer_id);
CREATE INDEX IF NOT EXISTS idx_approval_tokens_expires ON public.approval_tokens(expires_at) WHERE used_at IS NULL;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
  SELECT COALESCE((SELECT raw_app_meta_data->>'role' = 'admin' FROM auth.users WHERE id = auth.uid()), false);
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE policy_record record;
BEGIN
  FOR policy_record IN
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.customer_profiles', policy_record.policyname);
  END LOOP;
END
$$;

CREATE POLICY customer_profiles_select_own
ON public.customer_profiles
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY customer_profiles_select_admin
ON public.customer_profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY customer_profiles_update_approved_own
ON public.customer_profiles
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid() AND status = 'APPROVED')
WITH CHECK (auth_user_id = auth.uid() AND status = 'APPROVED');

REVOKE INSERT, DELETE ON public.customer_profiles FROM anon, authenticated;
REVOKE UPDATE ON public.customer_profiles FROM anon, authenticated;
GRANT UPDATE (
  representative_name,
  "position",
  company_name,
  postal_code,
  street,
  "number",
  neighborhood,
  city,
  "state",
  complement,
  reference_point,
  phone
) ON public.customer_profiles TO authenticated;

ALTER TABLE public.approval_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.approval_tokens FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_customer_approval_token(
  p_token_hash text,
  p_action varchar,
  p_reject_reason text DEFAULT NULL
)
RETURNS SETOF public.customer_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE token_record public.approval_tokens%ROWTYPE;
DECLARE customer_record public.customer_profiles%ROWTYPE;
BEGIN
  SELECT * INTO token_record
  FROM public.approval_tokens
  WHERE token_hash = p_token_hash
  FOR UPDATE;

  IF NOT FOUND OR token_record.used_at IS NOT NULL OR token_record.expires_at <= now() OR token_record.action <> p_action THEN
    RAISE EXCEPTION 'invalid approval token' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO customer_record
  FROM public.customer_profiles
  WHERE id = token_record.customer_id
  FOR UPDATE;

  IF NOT FOUND OR customer_record.status <> 'PENDING' THEN
    RAISE EXCEPTION 'invalid customer status' USING ERRCODE = 'P0001';
  END IF;

  IF p_action = 'APPROVE' THEN
    UPDATE public.customer_profiles
    SET status = 'APPROVED', approved_at = now(), approved_by = NULL, approval_method = 'EMAIL', updated_at = now()
    WHERE id = customer_record.id;
  ELSIF p_action = 'REJECT' THEN
    UPDATE public.customer_profiles
    SET status = 'REJECTED', rejected_at = now(), rejected_by = NULL, rejection_reason = NULLIF(trim(p_reject_reason), ''), approval_method = 'EMAIL', updated_at = now()
    WHERE id = customer_record.id;
  ELSE
    RAISE EXCEPTION 'invalid action' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.approval_tokens
  SET used_at = now()
  WHERE customer_id = customer_record.id AND used_at IS NULL;

  RETURN QUERY SELECT * FROM public.customer_profiles WHERE id = customer_record.id;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_customer_approval_token(text, varchar, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_customer_approval_token(text, varchar, text) TO service_role;
