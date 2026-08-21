-- CORREÇÃO CRÍTICA: Admin policies estão usando auth.role() = 'authenticated'
-- Isso permite QUALQUER usuário logado acessar como admin!
-- Corrigir para verificar user_metadata.role = 'admin'

-- Helper function para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'role') = 'admin';
$$ LANGUAGE SQL STABLE;

-- Categories
DROP POLICY IF EXISTS "admin_all_categories" ON categories;
CREATE POLICY "admin_categories_all" ON categories
  FOR ALL USING (is_admin());

-- Segments
DROP POLICY IF EXISTS "admin_all_segments" ON segments;
CREATE POLICY "admin_segments_all" ON segments
  FOR ALL USING (is_admin());

-- Brands
DROP POLICY IF EXISTS "admin_all_brands" ON brands;
CREATE POLICY "admin_brands_all" ON brands
  FOR ALL USING (is_admin());

-- Application Types
DROP POLICY IF EXISTS "admin_all_app_types" ON application_types;
CREATE POLICY "admin_app_types_all" ON application_types
  FOR ALL USING (is_admin());

-- Applications
DROP POLICY IF EXISTS "admin_all_apps" ON applications;
CREATE POLICY "admin_apps_all" ON applications
  FOR ALL USING (is_admin());

-- Products
DROP POLICY IF EXISTS "admin_all_products" ON products;
CREATE POLICY "admin_products_all" ON products
  FOR ALL USING (is_admin());

-- Product Segments
DROP POLICY IF EXISTS "admin_all_product_segments" ON product_segments;
CREATE POLICY "admin_product_segments_all" ON product_segments
  FOR ALL USING (is_admin());

-- Product Applications
DROP POLICY IF EXISTS "admin_all_product_apps" ON product_applications;
CREATE POLICY "admin_product_apps_all" ON product_applications
  FOR ALL USING (is_admin());

-- Product Specifications
DROP POLICY IF EXISTS "admin_all_specs" ON product_specifications;
CREATE POLICY "admin_specs_all" ON product_specifications
  FOR ALL USING (is_admin());

-- Product Documents
DROP POLICY IF EXISTS "admin_all_docs" ON product_documents;
CREATE POLICY "admin_docs_all" ON product_documents
  FOR ALL USING (is_admin());

-- Stock Movements
DROP POLICY IF EXISTS "admin_all_stock" ON stock_movements;
CREATE POLICY "admin_stock_all" ON stock_movements
  FOR ALL USING (is_admin());

-- Storage - product-images
DROP POLICY IF EXISTS "admin_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "admin_storage_delete" ON storage.objects;
CREATE POLICY "admin_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "admin_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- Storage - brand-logos
DROP POLICY IF EXISTS "admin_brand_logos_insert" ON storage.objects;
DROP POLICY IF EXISTS "admin_brand_logos_delete" ON storage.objects;
CREATE POLICY "admin_brand_logos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-logos' AND is_admin());
CREATE POLICY "admin_brand_logos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-logos' AND is_admin());
