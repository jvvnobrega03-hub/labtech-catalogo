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
  WHERE approval_tokens.customer_id = customer_record.id AND used_at IS NULL;

  RETURN QUERY SELECT * FROM public.customer_profiles WHERE id = customer_record.id;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_customer_approval_token(text, varchar, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_customer_approval_token(text, varchar, text) TO service_role;
