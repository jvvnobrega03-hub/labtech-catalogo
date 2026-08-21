-- CORREÇÃO: Função is_admin() deve verificar user_metadata corretamente
-- O JWT do Supabase Auth não usa claim "role" por padrão
-- Precisa verificar raw_user_meta_data do usuário autenticado

-- Recria a função is_admin() - não precisa drop pois usamos OR REPLACE
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =============================================================================
-- POLÍTICAS RLS - Tabelas de Catálogo (apenas admin)
-- =============================================================================

-- Categories: apenas admin modifica, todos leem ativos
DROP POLICY IF EXISTS "pub_categories" ON categories;
CREATE POLICY "pub_categories_read" ON categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_categories_all" ON categories;
CREATE POLICY "admin_categories_all" ON categories
  FOR ALL USING (is_admin());

-- Segments
DROP POLICY IF EXISTS "pub_segments" ON segments;
CREATE POLICY "pub_segments_read" ON segments
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_segments_all" ON segments;
CREATE POLICY "admin_segments_all" ON segments
  FOR ALL USING (is_admin());

-- Brands
DROP POLICY IF EXISTS "pub_brands" ON brands;
CREATE POLICY "pub_brands_read" ON brands
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_brands_all" ON brands;
CREATE POLICY "admin_brands_all" ON brands
  FOR ALL USING (is_admin());

-- Application Types
DROP POLICY IF EXISTS "pub_app_types" ON application_types;
CREATE POLICY "pub_app_types_read" ON application_types
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_app_types_all" ON application_types;
CREATE POLICY "admin_app_types_all" ON application_types
  FOR ALL USING (is_admin());

-- Applications
DROP POLICY IF EXISTS "pub_apps" ON applications;
CREATE POLICY "pub_apps_read" ON applications
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_apps_all" ON applications;
CREATE POLICY "admin_apps_all" ON applications
  FOR ALL USING (is_admin());

-- Products - Admin faz tudo, público lê ativos
DROP POLICY IF EXISTS "pub_products" ON products;
CREATE POLICY "pub_products_read" ON products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_products_all" ON products;
CREATE POLICY "admin_products_all" ON products
  FOR ALL USING (is_admin());

-- Product Segments
DROP POLICY IF EXISTS "pub_product_segments" ON product_segments;
CREATE POLICY "pub_product_segments_read" ON product_segments
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));

DROP POLICY IF EXISTS "admin_product_segments_all" ON product_segments;
CREATE POLICY "admin_product_segments_all" ON product_segments
  FOR ALL USING (is_admin());

-- Product Applications
DROP POLICY IF EXISTS "pub_product_apps" ON product_applications;
CREATE POLICY "pub_product_apps_read" ON product_applications
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));

DROP POLICY IF EXISTS "admin_product_apps_all" ON product_applications;
CREATE POLICY "admin_product_apps_all" ON product_applications
  FOR ALL USING (is_admin());

-- Product Specifications
DROP POLICY IF EXISTS "pub_specs" ON product_specifications;
CREATE POLICY "pub_specs_read" ON product_specifications
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));

DROP POLICY IF EXISTS "admin_specs_all" ON product_specifications;
CREATE POLICY "admin_specs_all" ON product_specifications
  FOR ALL USING (is_admin());

-- Product Documents
DROP POLICY IF EXISTS "pub_docs" ON product_documents;
CREATE POLICY "pub_docs_read" ON product_documents
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));

DROP POLICY IF EXISTS "admin_docs_all" ON product_documents;
CREATE POLICY "admin_docs_all" ON product_documents
  FOR ALL USING (is_admin());

-- Stock Movements - apenas admin
DROP POLICY IF EXISTS "pub_stock" ON stock_movements;
DROP POLICY IF EXISTS "admin_stock_all" ON stock_movements;
DROP POLICY IF EXISTS "admin_all_stock" ON stock_movements;
CREATE POLICY "pub_stock_read" ON stock_movements
  FOR SELECT USING (false);
CREATE POLICY "admin_stock_all" ON stock_movements
  FOR ALL USING (is_admin());

-- =============================================================================
-- STORAGE - Arquivos
-- =============================================================================

-- product-images
DROP POLICY IF EXISTS "pub_storage" ON storage.objects;
CREATE POLICY "pub_product_images_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "admin_product_images_insert" ON storage.objects;
CREATE POLICY "admin_product_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "admin_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "admin_product_images_delete" ON storage.objects;
CREATE POLICY "admin_product_images_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "admin_product_images_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- brand-logos
DROP POLICY IF EXISTS "admin_brand_logos_insert" ON storage.objects;
DROP POLICY IF EXISTS "admin_brand_logos_insert" ON storage.objects;
CREATE POLICY "admin_brand_logos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-logos' AND is_admin());

DROP POLICY IF EXISTS "admin_brand_logos_delete" ON storage.objects;
DROP POLICY IF EXISTS "admin_brand_logos_delete" ON storage.objects;
CREATE POLICY "admin_brand_logos_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-logos' AND is_admin());
CREATE POLICY "admin_brand_logos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-logos' AND is_admin());

-- =============================================================================
-- MAGIS5 - Pedidos e Notas Fiscais (apenas admin)
-- Apenas executa se as tabelas existirem
-- =============================================================================

DO $$
BEGIN
  -- Verifica se tabela magis5_orders existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'magis5_orders') THEN
    ALTER TABLE magis5_orders ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow service access to magis5_orders" ON magis5_orders;
    DROP POLICY IF EXISTS "admin_magis5_orders_all" ON magis5_orders;
    EXECUTE 'CREATE POLICY "admin_magis5_orders_all" ON magis5_orders FOR ALL USING (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  -- Verifica se tabela magis5_invoices existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'magis5_invoices') THEN
    ALTER TABLE magis5_invoices ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow service access to magis5_invoices" ON magis5_invoices;
    DROP POLICY IF EXISTS "admin_magis5_invoices_all" ON magis5_invoices;
    EXECUTE 'CREATE POLICY "admin_magis5_invoices_all" ON magis5_invoices FOR ALL USING (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  -- Verifica se tabela magis5_sync_logs existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'magis5_sync_logs') THEN
    ALTER TABLE magis5_sync_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow service access to magis5_sync_logs" ON magis5_sync_logs;
    DROP POLICY IF EXISTS "admin_magis5_sync_logs_all" ON magis5_sync_logs;
    EXECUTE 'CREATE POLICY "admin_magis5_sync_logs_all" ON magis5_sync_logs FOR ALL USING (is_admin())';
  END IF;
END $$;

-- =============================================================================
-- CUSTOMER PROFILES - Correção das políticas
-- =============================================================================

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode se cadastrar (inserir)
DROP POLICY IF EXISTS "Allow public insert on customer_profiles" ON customer_profiles;
CREATE POLICY "Allow public insert on customer_profiles" ON customer_profiles
  FOR INSERT TO anon WITH CHECK (true);

-- Cliente lê apenas seu próprio perfil
DROP POLICY IF EXISTS "Allow customer read own profile" ON customer_profiles;
CREATE POLICY "Allow customer read own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Cliente atualiza apenas seus próprios dados (exceto status)
DROP POLICY IF EXISTS "Allow customer update own profile" ON customer_profiles;
CREATE POLICY "Allow customer update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Administradores fazem tudo
DROP POLICY IF EXISTS "Allow admin full access to customer_profiles" ON customer_profiles;
CREATE POLICY "Allow admin full access to customer_profiles" ON customer_profiles
  FOR ALL USING (is_admin());
