-- SQL SIMPLES - Execute apenas isso no Supabase

-- CATEGORIAS
CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, short_name TEXT, icon TEXT DEFAULT 'TestTube', image_url TEXT, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- SEGMENTOS
CREATE TABLE segments (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, icon TEXT, image_url TEXT, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- MARCAS
CREATE TABLE brands (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, logo_url TEXT, website TEXT, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- TIPOS DE APLICAÇÃO
CREATE TABLE application_types (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- APLICAÇÕES
CREATE TABLE applications (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, application_type_id TEXT, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- PRODUTOS
CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, reference TEXT NOT NULL UNIQUE, short_description TEXT, description TEXT, category_id TEXT, brand_id TEXT, is_active BOOLEAN DEFAULT true, is_featured BOOLEAN DEFAULT false, is_new BOOLEAN DEFAULT false, availability TEXT DEFAULT 'consult', stock_quantity INTEGER DEFAULT 0, minimum_stock INTEGER DEFAULT 0, is_consult_only BOOLEAN DEFAULT false, main_image_url TEXT, gallery_urls TEXT[] DEFAULT '{}', keywords TEXT[] DEFAULT '{}', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- ASSOCIATIVAS
CREATE TABLE product_segments (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, product_id TEXT NOT NULL, segment_id TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE product_applications (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, product_id TEXT NOT NULL, application_id TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE product_specifications (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, product_id TEXT NOT NULL, label TEXT NOT NULL, value TEXT NOT NULL, sort_order INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- STOCK
CREATE TABLE stock_movements (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, product_id TEXT NOT NULL, type TEXT NOT NULL, quantity INTEGER NOT NULL, previous_quantity INTEGER NOT NULL, new_quantity INTEGER NOT NULL, reason TEXT, created_by TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- POLITICAS
CREATE POLICY "pub_cat" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "pub_seg" ON segments FOR SELECT USING (is_active = true);
CREATE POLICY "pub_brand" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "pub_app_type" ON application_types FOR SELECT USING (is_active = true);
CREATE POLICY "pub_app" ON applications FOR SELECT USING (is_active = true);
CREATE POLICY "pub_prod" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "pub_ps" ON product_segments FOR SELECT USING (true);
CREATE POLICY "pub_pa" ON product_applications FOR SELECT USING (true);
CREATE POLICY "pub_spec" ON product_specifications FOR SELECT USING (true);
CREATE POLICY "pub_stock" ON stock_movements FOR SELECT USING (false);

CREATE POLICY "admin_cat" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_seg" ON segments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_brand" ON brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_app_type" ON application_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_app" ON applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_prod" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_ps" ON product_segments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_pa" ON product_applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_spec" ON product_specifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_stock" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');

-- SEED CATEGORIAS
INSERT INTO categories (id, name, slug, description, short_name, icon, sort_order, is_active) VALUES ('coleta', 'Coleta e Acondicionamento', 'coleta-acondicionamento', 'Tubos de coleta, agulhas', 'Coleta', 'TestTube', 1, true), ('equipamentos', 'Equipamentos Laboratoriais', 'equipamentos-laboratoriais', 'Centrifugas, microscopios', 'Equipamentos', 'FlaskConical', 2, true), ('reagentes', 'Reagentes e Kits', 'reagentes-kits', 'Reagentes para analises', 'Reagentes', 'Beaker', 3, true), ('diagnostico', 'Diagnostico in vitro', 'diagnostico-in-vitro', 'Testes rapidos', 'IVD', 'ClipboardList', 4, true), ('microbiologia', 'Microbiologia', 'microbiologia', 'Meios de cultura', 'Microbiologia', 'CircleDot', 5, true), ('hematologia', 'Hematologia e Bioquimica', 'hematologia-bioquimica', 'Reagentes hematologicos', 'Hematologia', 'HeartPulse', 6, true), ('vidrarias', 'Vidrarias', 'vidrarias', 'Tubos, frascos', 'Vidrarias', 'Beaker', 7, true), ('microscopia', 'Microscopia', 'microscopia', 'Microscopios', 'Microscopia', 'Microscope', 8, true), ('armazenamento', 'Armazenamento', 'armazenamento', 'Freezers', 'Armazenamento', 'Archive', 9, true), ('biosseguranca', 'Biosseguranca', 'biosseguranca', 'EPIs', 'Biosseguranca', 'Shield', 10, true);

-- SEED SEGMENTOS
INSERT INTO segments (id, name, slug, description, sort_order, is_active) VALUES ('laboratorial', 'Laboratorio Clinico', 'laboratorio-clinico', 'Labs de analises', 1, true), ('hospitalar', 'Hospitalar', 'hospitalar', 'Hospitais', 2, true), ('veterinario', 'Veterinario', 'veterinario', 'Clinicas vet', 3, true), ('pesquisa', 'Pesquisa', 'pesquisa', 'Pesquisa', 4, true);

-- SEED MARCAS
INSERT INTO brands (id, name, slug, description, sort_order, is_active) VALUES ('labtech-essentials', 'LabTech Essentials', 'labtech-essentials', 'Linha essencial', 1, true), ('labtech-pro', 'LabTech Pro', 'labtech-pro', 'Linha profissional', 2, true), ('labtech-instruments', 'LabTech Instruments', 'labtech-instruments', 'Instrumentos', 3, true), ('labtech-diagnostics', 'LabTech Diagnostics', 'labtech-diagnostics', 'Diagnosticos', 4, true), ('optiview', 'OptiView', 'optiview', 'Microscopia', 5, true);

-- SEED TIPOS
INSERT INTO application_types (id, name, slug, description, sort_order, is_active) VALUES ('hematologia', 'Hematologia', 'hematologia', 'Analises hematologicas', 1, true), ('bioquimica', 'Bioquimica', 'bioquimica', 'Analises bioquimicas', 2, true), ('diagnostico', 'Diagnostico', 'diagnostico', 'Diagnostico clinico', 3, true), ('centrifugacao', 'Centrifugacao', 'centrifugacao', 'Centrifugacao', 4, true);

-- SEED APLICACOES
INSERT INTO applications (id, name, slug, description, application_type_id, sort_order, is_active) VALUES ('coleta-amostras', 'Coleta de Amostras', 'coleta-amostras', 'Coleta de amostras', 'diagnostico', 1, true), ('centrifugacao', 'Centrifugacao', 'centrifugacao', 'Separacao', 'centrifugacao', 2, true), ('hematologia-analise', 'Hematologia', 'hematologia-analise', 'Analises hematologicas', 'hematologia', 3, true), ('bioquimica-analise', 'Bioquimica', 'bioquimica-analise', 'Analises bioquimicas', 'bioquimica', 4, true), ('diagnostico-rapido', 'Diagnostico Rapido', 'diagnostico-rapido', 'Testes rapidos', 'diagnostico', 5, true);

-- SEED PRODUTOS
INSERT INTO products (id, name, slug, reference, short_description, category_id, brand_id, is_active, is_featured, is_new, availability, stock_quantity, minimum_stock) VALUES ('p001', 'Tubo de Coleta a Vazio', 'tubo-coleta-vazio', 'TCV-001', 'Tubo de vidro com ativador', 'coleta', 'labtech-essentials', true, true, false, 'consult', 1000, 100), ('p002', 'Agulha para Coleta 21G', 'agulha-coleta-21g', 'ACS-021', 'Agulha descartavel', 'coleta', 'labtech-essentials', true, false, false, 'consult', 500, 50), ('p003', 'Sistema de Coleta Integrado', 'sistema-coleta-integrado', 'SCI-001', 'Sistema completo', 'coleta', 'labtech-pro', true, true, false, 'consult', 200, 30), ('p004', 'Tubo EDTA K2 3mL', 'tubo-edta-k2', 'TEDTA-003', 'Tubo com anticoagulante', 'coleta', 'labtech-essentials', true, false, false, 'in-stock', 800, 100), ('p005', 'Centrifuga de Mesa 24 Tubos', 'centrifuga-mesa-24', 'CM-2400', 'Centrifuga 300-6000 RPM', 'equipamentos', 'labtech-instruments', true, true, true, 'consult', 15, 3), ('p006', 'Microscopio Biologico Invertido', 'microscopio-invertido', 'MBI-001', 'Microscopio para cultura celular', 'equipamentos', 'optiview', true, true, false, 'consult', 8, 2), ('p007', 'Agitador Orbital com Incubacao', 'agitador-orbital', 'AOI-200', 'Agitador 25-500 RPM', 'equipamentos', 'labtech-instruments', true, false, true, 'consult', 10, 2), ('p008', 'Reagente Glucose Enzimatico', 'reagente-glucose', 'RGL-001', 'Kit para glicose', 'reagentes', 'labtech-diagnostics', true, true, false, 'in-stock', 150, 20), ('p009', 'Kit Hemoglobina Glicada', 'kit-hba1c', 'KHBA-001', 'Kit HbA1c', 'reagentes', 'labtech-diagnostics', true, true, true, 'consult', 50, 10), ('p010', 'Kit Perfil Lipidico', 'kit-lipidico', 'KPL-001', 'Kit colesterol', 'reagentes', 'labtech-diagnostics', true, false, false, 'in-stock', 80, 15);

-- RELACOES
INSERT INTO product_segments (product_id, segment_id) VALUES ('p001', 'laboratorial'), ('p001', 'hospitalar'), ('p002', 'laboratorial'), ('p002', 'hospitalar'), ('p003', 'laboratorial'), ('p003', 'hospitalar'), ('p004', 'laboratorial'), ('p004', 'hospitalar'), ('p005', 'laboratorial'), ('p005', 'hospitalar'), ('p005', 'pesquisa'), ('p006', 'laboratorial'), ('p006', 'pesquisa'), ('p007', 'laboratorial'), ('p007', 'pesquisa'), ('p008', 'laboratorial'), ('p008', 'hospitalar'), ('p009', 'laboratorial'), ('p009', 'hospitalar'), ('p010', 'laboratorial'), ('p010', 'hospitalar');

INSERT INTO product_applications (product_id, application_id) VALUES ('p001', 'coleta-amostras'), ('p004', 'coleta-amostras'), ('p004', 'hematologia-analise'), ('p005', 'centrifugacao'), ('p006', 'hematologia-analise'), ('p008', 'bioquimica-analise'), ('p009', 'hematologia-analise'), ('p009', 'bioquimica-analise'), ('p010', 'bioquimica-analise');

-- SPECS
INSERT INTO product_specifications (product_id, label, value, sort_order) VALUES ('p001', 'Volume', '5 mL', 1), ('p001', 'Material', 'Vidro borossilicato', 2), ('p005', 'Capacidade', '24 x 15 mL', 1), ('p005', 'Velocidade', '300-6000 RPM', 2), ('p008', 'Metodo', 'GOD-PAP', 1);

-- STORAGE
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('product-images', 'product-images', true, 10485760) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "pub_storage" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "admin_storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
