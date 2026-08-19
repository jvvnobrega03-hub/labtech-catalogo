-- Tabelas para integração com Magis5

-- Tabela de pedidos do Magis5
CREATE TABLE IF NOT EXISTS magis5_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magis5_order_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  original_status VARCHAR(255),
  customer_name VARCHAR(255),
  total_value DECIMAL(12,2),
  items_count INTEGER DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de notas fiscais do Magis5
CREATE TABLE IF NOT EXISTS magis5_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magis5_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  original_status VARCHAR(255),
  invoice_key VARCHAR(255),
  issue_date DATE,
  total_value DECIMAL(12,2),
  order_reference VARCHAR(255),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de log de sincronização
CREATE TABLE IF NOT EXISTS magis5_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL, -- 'products', 'stock', 'orders', 'invoices'
  status VARCHAR(50) NOT NULL, -- 'success', 'error', 'partial'
  items_processed INTEGER DEFAULT 0,
  items_error INTEGER DEFAULT 0,
  raw_request JSONB,
  response_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar pedidos por ID do Magis5
CREATE INDEX IF NOT EXISTS idx_magis5_orders_order_id ON magis5_orders(magis5_order_id);
CREATE INDEX IF NOT EXISTS idx_magis5_orders_status ON magis5_orders(status);

-- Índice para buscar notas fiscais por número
CREATE INDEX IF NOT EXISTS idx_magis5_invoices_invoice_id ON magis5_invoices(magis5_invoice_id);
CREATE INDEX IF NOT EXISTS idx_magis5_invoices_status ON magis5_invoices(status);

-- Índice para logs de sincronização
CREATE INDEX IF NOT EXISTS idx_magis5_sync_logs_type ON magis5_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_magis5_sync_logs_created ON magis5_sync_logs(created_at DESC);

-- Função RPC para diminuir estoque (opcional)
CREATE OR REPLACE FUNCTION decrease_product_stock(p_reference TEXT, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity),
      updated_at = NOW()
  WHERE reference = p_reference;
END;
$$ LANGUAGE plpgsql;

-- Habilitar Row Level Security (opcional)
ALTER TABLE magis5_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE magis5_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE magis5_sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (apenas para serviço, não para clientes)
DROP POLICY IF EXISTS "Allow service access to magis5_orders" ON magis5_orders;
CREATE POLICY "Allow service access to magis5_orders" ON magis5_orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service access to magis5_invoices" ON magis5_invoices;
CREATE POLICY "Allow service access to magis5_invoices" ON magis5_invoices
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service access to magis5_sync_logs" ON magis5_sync_logs;
CREATE POLICY "Allow service access to magis5_sync_logs" ON magis5_sync_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
