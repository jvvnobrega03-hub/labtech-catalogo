-- Sistema de Chamados, Manutenções e Solicitações

-- ============================================
-- TABELA DE CHAMADOS
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  protocol VARCHAR(20) UNIQUE NOT NULL,

  -- Tipo e categoria
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'COMERCIAL', 'FINANCEIRO', 'PRODUTO', 'PEDIDO', 'ENTREGA',
    'NOTA_FISCAL', 'DOCUMENTACAO', 'SUPORTE_TECNICO', 'MANUTENCAO',
    'GARANTIA', 'RECLAMACAO', 'DUVIDA', 'OUTRO'
  )),

  -- Dados do chamado
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'ALTA', 'URGENTE')),
  status VARCHAR(30) DEFAULT 'ABERTO' CHECK (status IN (
    'ABERTO', 'AGUARDANDO_CLIENTE', 'AGUARDANDO_RESPOSTA', 'EM_ANDAMENTO',
    'AGUARDANDO_APROVACAO', 'AGUARDANDO_FATURAMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO'
  )),

  -- Responsável
  assigned_admin_id UUID REFERENCES auth.users(id),

  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Índice para búsquedas
CREATE INDEX idx_tickets_client ON tickets(client_id);
CREATE INDEX idx_tickets_protocol ON tickets(protocol);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ============================================
-- TABELA DE MENSAGENS DOS CHAMADOS
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('CLIENTE', 'ADMIN', 'TECNICO')),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- ============================================
-- TABELA DE ANEXOS DOS CHAMADOS
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA DE MANUTENÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  protocol VARCHAR(20) UNIQUE NOT NULL,

  -- Equipamento
  equipment_type VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  asset_number VARCHAR(100),
  acquisition_date DATE,

  -- Tipo de solicitação
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
    'MANUTENCAO_CORRETIVA', 'MANUTENCAO_PREVENTIVA', 'CALIBRACAO',
    'INSTALACAO', 'AVALIACAO_TECNICA', 'VISITA_TECNICA', 'TREINAMENTO',
    'TROCA_PECA', 'GARANTIA', 'OUTRO'
  )),

  -- Problema
  description TEXT NOT NULL,
  issue_started_at DATE,
  operational_status VARCHAR(20) CHECK (operational_status IN ('FUNCIONANDO', 'PARCIALMENTE', 'NAO_FUNCIONANDO')),
  impact_level VARCHAR(20) CHECK (impact_level IN ('NAO', 'PARCIALMENTE', 'SIM')),
  priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'ALTA', 'URGENTE')),

  -- Status
  status VARCHAR(40) DEFAULT 'RECEBIDO' CHECK (status IN (
    'RECEBIDO', 'AGUARDANDO_ANALISE', 'EM_ANALISE', 'AGUARDANDO_INFO',
    'AGUARDANDO_APROVACAO', 'VISITA_A_AGENDAR', 'VISITA_AGENDADA',
    'TECNICO_A_CAMINHO', 'EM_ATENDIMENTO', 'EM_MANUTENCAO',
    'AGUARDANDO_PECA', 'AGUARDANDO_ORCAMENTO', 'ORCAMENTO_ENVIADO',
    'ORCAMENTO_APROVADO', 'ORCAMENTO_REJEITADO', 'CONCLUIDO', 'CANCELADO'
  )),

  -- Responsáveis
  assigned_admin_id UUID REFERENCES auth.users(id),
  assigned_technician_id UUID REFERENCES auth.users(id),

  -- Endereço do equipamento
  use_registered_address BOOLEAN DEFAULT TRUE,
  address_id UUID REFERENCES customer_profiles(id),
  custom_address JSONB,

  -- Contato local
  local_contact_name VARCHAR(255),
  local_contact_phone VARCHAR(20),
  local_contact_whatsapp VARCHAR(20),
  local_contact_email VARCHAR(255),
  local_contact_sector VARCHAR(100),

  -- Disponibilidade
  preferred_period VARCHAR(20) CHECK (preferred_period IN ('MANHA', 'TARDE', 'QUALQUER')),
  preferred_dates DATE[],

  -- Orçamento (JSONB para flexibilidade)
  budget JSONB,

  -- Avaliação
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,

  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_maintenance_client ON maintenance_requests(client_id);
CREATE INDEX idx_maintenance_protocol ON maintenance_requests(protocol);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);

-- ============================================
-- TABELA DE MENSAGENS DA MANUTENÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('CLIENTE', 'ADMIN', 'TECNICO')),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_maintenance_messages_maintenance ON maintenance_messages(maintenance_id);

-- ============================================
-- TABELA DE ANEXOS DA MANUTENÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  message_id UUID REFERENCES maintenance_messages(id) ON DELETE CASCADE,
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA DE HISTÓRICO DE STATUS
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  previous_status VARCHAR(40),
  new_status VARCHAR(40) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_maintenance ON maintenance_status_history(maintenance_id);

-- ============================================
-- TABELA DE SOLICITAÇÕES GERAIS
-- ============================================
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  protocol VARCHAR(20) UNIQUE NOT NULL,

  type VARCHAR(50) NOT NULL CHECK (type IN (
    'ORCAMENTO_COMERCIAL', 'SEGUNDA_VIA', 'DOCUMENTACAO',
    'CATALOGO', 'FICHA_TECNICA', 'CERTIFICADO', 'INFORMACOES_PRODUTO',
    'SOLICITACAO_ADMINISTRATIVA', 'OUTRO'
  )),

  subject VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'NORMAL',
  status VARCHAR(30) DEFAULT 'ABERTO' CHECK (status IN (
    'ABERTO', 'AGUARDANDO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'
  )),

  assigned_admin_id UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_requests_client ON requests(client_id);

-- ============================================
-- TABELA DE MENSAGENS DAS SOLICITAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS request_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('CLIENTE', 'ADMIN')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA DE NOTIFICAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('CLIENTE', 'ADMIN')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'TICKET', 'MAINTENANCE', 'REQUEST', 'MESSAGE', 'STATUS', 'BUDGET', 'VISIT', 'GENERAL'
  )),
  reference_id UUID,
  reference_type VARCHAR(30),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, user_type, is_read);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Gerar protocolo de chamado
CREATE OR REPLACE FUNCTION generate_ticket_protocol()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  count INTEGER;
  protocol TEXT;
BEGIN
  SELECT COUNT(*)::INTEGER + 1 INTO count FROM tickets;
  protocol := 'CHA-' || LPAD(count::TEXT, 6, '0');
  RETURN protocol;
END;
$$;

-- Gerar protocolo de manutenção
CREATE OR REPLACE FUNCTION generate_maintenance_protocol()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  count INTEGER;
  protocol TEXT;
BEGIN
  SELECT COUNT(*)::INTEGER + 1 INTO count FROM maintenance_requests;
  protocol := 'MAN-' || LPAD(count::TEXT, 6, '0');
  RETURN protocol;
END;
$$;

-- Gerar protocolo de solicitação
CREATE OR REPLACE FUNCTION generate_request_protocol()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  count INTEGER;
  protocol TEXT;
BEGIN
  SELECT COUNT(*)::INTEGER + 1 INTO count FROM requests;
  protocol := 'SOL-' || LPAD(count::TEXT, 6, '0');
  RETURN protocol;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Tickets: clientes veem apenas seus próprios
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients own tickets" ON tickets;
CREATE POLICY "clients own tickets" ON tickets
  FOR ALL USING (
    client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admins manage tickets" ON tickets;
CREATE POLICY "admins manage tickets" ON tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Ticket messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket messages access" ON ticket_messages;
CREATE POLICY "ticket messages access" ON ticket_messages
  FOR ALL USING (
    ticket_id IN (SELECT id FROM tickets WHERE
      client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    )
  );

-- Maintenance requests
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients own maintenance" ON maintenance_requests;
CREATE POLICY "clients own maintenance" ON maintenance_requests
  FOR ALL USING (
    client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admins manage maintenance" ON maintenance_requests;
CREATE POLICY "admins manage maintenance" ON maintenance_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Maintenance messages
ALTER TABLE maintenance_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maintenance messages access" ON maintenance_messages;
CREATE POLICY "maintenance messages access" ON maintenance_messages
  FOR ALL USING (
    maintenance_id IN (SELECT id FROM maintenance_requests WHERE
      client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    )
  );

-- Requests
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients own requests" ON requests;
CREATE POLICY "clients own requests" ON requests
  FOR ALL USING (
    client_id IN (SELECT id FROM customer_profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admins manage requests" ON requests;
CREATE POLICY "admins manage requests" ON requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own notifications" ON notifications;
CREATE POLICY "users see own notifications" ON notifications
  FOR ALL USING (
    user_id = auth.uid()
  );
