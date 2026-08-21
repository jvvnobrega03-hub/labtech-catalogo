-- Corrigir políticas RLS que tentam acessar auth.users
-- O acesso a auth.users é restrito, então usamos auth.jwt() para verificar o role

-- Corrigir customer_profiles
DROP POLICY IF EXISTS "Allow customer read own profile" ON customer_profiles;
CREATE POLICY "Allow customer read own profile" ON customer_profiles
  FOR SELECT USING (
    auth.uid() = auth_user_id OR
    (auth.jwt() ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Allow customer update own profile" ON customer_profiles;
CREATE POLICY "Allow customer update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Allow admin full access to customer_profiles" ON customer_profiles;
CREATE POLICY "Allow admin full access to customer_profiles" ON customer_profiles
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Corrigir tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients own tickets" ON tickets;
CREATE POLICY "clients own tickets" ON tickets
  FOR ALL USING (
    client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admins manage tickets" ON tickets;
CREATE POLICY "admins manage tickets" ON tickets
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Corrigir ticket_messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket messages access" ON ticket_messages;
CREATE POLICY "ticket messages access" ON ticket_messages
  FOR ALL USING (
    ticket_id IN (SELECT id FROM tickets WHERE
      client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
      OR (auth.jwt() ->> 'role') = 'admin'
    )
  );

-- Corrigir maintenance_requests
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients own maintenance" ON maintenance_requests;
CREATE POLICY "clients own maintenance" ON maintenance_requests
  FOR ALL USING (
    client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admins manage maintenance" ON maintenance_requests;
CREATE POLICY "admins manage maintenance" ON maintenance_requests
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Corrigir maintenance_messages
ALTER TABLE maintenance_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maintenance messages access" ON maintenance_messages;
CREATE POLICY "maintenance messages access" ON maintenance_messages
  FOR ALL USING (
    maintenance_id IN (SELECT id FROM maintenance_requests WHERE
      client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
      OR (auth.jwt() ->> 'role') = 'admin'
    )
  );

-- Corrigir requests
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients own requests" ON requests;
CREATE POLICY "clients own requests" ON requests
  FOR ALL USING (
    client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admins manage requests" ON requests;
CREATE POLICY "admins manage requests" ON requests
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Corrigir notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own notifications" ON notifications;
CREATE POLICY "users see own notifications" ON notifications
  FOR ALL USING (
    user_id = auth.uid()
  );
