-- ============================================
-- POLÍTICAS DE ADMIN (RLS)
-- ============================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se o usuário está autenticado e tem role de admin
    -- Isso será configurado após criar usuários no Supabase Auth
    RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categorias - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir categorias" ON categories;
CREATE POLICY "Admin pode inserir categorias" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar categorias" ON categories;
CREATE POLICY "Admin pode atualizar categorias" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir categorias" ON categories;
CREATE POLICY "Admin pode excluir categorias" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Segmentos - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir segmentos" ON segments;
CREATE POLICY "Admin pode inserir segmentos" ON segments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar segmentos" ON segments;
CREATE POLICY "Admin pode atualizar segmentos" ON segments
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir segmentos" ON segments;
CREATE POLICY "Admin pode excluir segmentos" ON segments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Marcas - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir marcas" ON brands;
CREATE POLICY "Admin pode inserir marcas" ON brands
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar marcas" ON brands;
CREATE POLICY "Admin pode atualizar marcas" ON brands
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir marcas" ON brands;
CREATE POLICY "Admin pode excluir marcas" ON brands
    FOR DELETE USING (auth.role() = 'authenticated');

-- Tipos de Aplicação - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir tipos de aplicação" ON application_types;
CREATE POLICY "Admin pode inserir tipos de aplicação" ON application_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar tipos de aplicação" ON application_types;
CREATE POLICY "Admin pode atualizar tipos de aplicação" ON application_types
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir tipos de aplicação" ON application_types;
CREATE POLICY "Admin pode excluir tipos de aplicação" ON application_types
    FOR DELETE USING (auth.role() = 'authenticated');

-- Aplicações - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir aplicações" ON applications;
CREATE POLICY "Admin pode inserir aplicações" ON applications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar aplicações" ON applications;
CREATE POLICY "Admin pode atualizar aplicações" ON applications
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir aplicações" ON applications;
CREATE POLICY "Admin pode excluir aplicações" ON applications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Produtos - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir produtos" ON products;
CREATE POLICY "Admin pode inserir produtos" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar produtos" ON products;
CREATE POLICY "Admin pode atualizar produtos" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir produtos" ON products;
CREATE POLICY "Admin pode excluir produtos" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Produto-Segmentos - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir produto-segmentos" ON product_segments;
CREATE POLICY "Admin pode inserir produto-segmentos" ON product_segments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar produto-segmentos" ON product_segments;
CREATE POLICY "Admin pode atualizar produto-segmentos" ON product_segments
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir produto-segmentos" ON product_segments;
CREATE POLICY "Admin pode excluir produto-segmentos" ON product_segments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Produto-Aplicações - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir produto-aplicações" ON product_applications;
CREATE POLICY "Admin pode inserir produto-aplicações" ON product_applications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar produto-aplicações" ON product_applications;
CREATE POLICY "Admin pode atualizar produto-aplicações" ON product_applications
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir produto-aplicações" ON product_applications;
CREATE POLICY "Admin pode excluir produto-aplicações" ON product_applications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Especificações - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir especificações" ON product_specifications;
CREATE POLICY "Admin pode inserir especificações" ON product_specifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar especificações" ON product_specifications;
CREATE POLICY "Admin pode atualizar especificações" ON product_specifications
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir especificações" ON product_specifications;
CREATE POLICY "Admin pode excluir especificações" ON product_specifications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Documentos - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir documentos" ON product_documents;
CREATE POLICY "Admin pode inserir documentos" ON product_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar documentos" ON product_documents;
CREATE POLICY "Admin pode atualizar documentos" ON product_documents
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir documentos" ON product_documents;
CREATE POLICY "Admin pode excluir documentos" ON product_documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Movimentações de Estoque - Admin pode fazer tudo
DROP POLICY IF EXISTS "Admin pode inserir movimentações" ON stock_movements;
CREATE POLICY "Admin pode inserir movimentações" ON stock_movements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode ler movimentações" ON stock_movements;
CREATE POLICY "Admin pode ler movimentações" ON stock_movements
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar movimentações" ON stock_movements;
CREATE POLICY "Admin pode atualizar movimentações" ON stock_movements
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode excluir movimentações" ON stock_movements;
CREATE POLICY "Admin pode excluir movimentações" ON stock_movements
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE - Bucket para imagens
-- ============================================

-- Criar bucket para imagens de produtos (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Bucket para logos de marcas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-logos', 'brand-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view brand logos" ON storage.objects;
CREATE POLICY "Anyone can view brand logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'brand-logos');

DROP POLICY IF EXISTS "Admin can upload brand logos" ON storage.objects;
CREATE POLICY "Admin can upload brand logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete brand logos" ON storage.objects;
CREATE POLICY "Admin can delete brand logos" ON storage.objects
    FOR DELETE USING (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');
