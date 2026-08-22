UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
WHERE raw_user_meta_data->>'role' = 'admin'
  AND COALESCE(raw_app_meta_data->>'role', '') <> 'admin';

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

REVOKE ALL ON FUNCTION public.generate_approval_token() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_approval_token(uuid, varchar) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_approval_token(text, varchar) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_token_used(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_customer(uuid, varchar) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_customer(uuid, text, varchar) FROM PUBLIC, anon, authenticated;

DO $$
DECLARE table_name text;
DECLARE policy_record record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['tickets', 'ticket_messages', 'maintenance_requests', 'maintenance_messages', 'requests', 'notifications']
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = table_name
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, table_name);
      END LOOP;
    END IF;
  END LOOP;
END
$$;

CREATE POLICY tickets_approved_customer
ON public.tickets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE id = tickets.client_id AND auth_user_id = auth.uid() AND status = 'APPROVED'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE id = tickets.client_id AND auth_user_id = auth.uid() AND status = 'APPROVED'
  )
);
CREATE POLICY tickets_admin ON public.tickets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY ticket_messages_approved_customer
ON public.ticket_messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.customer_profiles cp ON cp.id = t.client_id
    WHERE t.id = ticket_messages.ticket_id AND cp.auth_user_id = auth.uid() AND cp.status = 'APPROVED'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.customer_profiles cp ON cp.id = t.client_id
    WHERE t.id = ticket_messages.ticket_id AND cp.auth_user_id = auth.uid() AND cp.status = 'APPROVED'
  )
);
CREATE POLICY ticket_messages_admin ON public.ticket_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY maintenance_requests_approved_customer
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE id = maintenance_requests.client_id AND auth_user_id = auth.uid() AND status = 'APPROVED'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE id = maintenance_requests.client_id AND auth_user_id = auth.uid() AND status = 'APPROVED'
  )
);
CREATE POLICY maintenance_requests_admin ON public.maintenance_requests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY maintenance_messages_approved_customer
ON public.maintenance_messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.maintenance_requests mr
    JOIN public.customer_profiles cp ON cp.id = mr.client_id
    WHERE mr.id = maintenance_messages.maintenance_id AND cp.auth_user_id = auth.uid() AND cp.status = 'APPROVED'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.maintenance_requests mr
    JOIN public.customer_profiles cp ON cp.id = mr.client_id
    WHERE mr.id = maintenance_messages.maintenance_id AND cp.auth_user_id = auth.uid() AND cp.status = 'APPROVED'
  )
);
CREATE POLICY maintenance_messages_admin ON public.maintenance_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY requests_approved_customer
ON public.requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE id = requests.client_id AND auth_user_id = auth.uid() AND status = 'APPROVED'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE id = requests.client_id AND auth_user_id = auth.uid() AND status = 'APPROVED'
  )
);
CREATE POLICY requests_admin ON public.requests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY notifications_approved_customer
ON public.notifications
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE auth_user_id = auth.uid() AND status = 'APPROVED'
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE auth_user_id = auth.uid() AND status = 'APPROVED'
  )
);
CREATE POLICY notifications_admin ON public.notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
