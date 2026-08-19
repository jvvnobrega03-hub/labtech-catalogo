-- LABTECH Catálogo - Schema Simplificado
-- Copie e cole tudo no SQL Editor do Supabase

-- CATEGORIAS
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_name TEXT,
    icon TEXT DEFAULT 'TestTube',
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEGMENTOS
CREATE TABLE segments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MARCAS
CREATE TABLE brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TIPOS DE APLICAÇÃO
CREATE TABLE application_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- APLICAÇÕES
CREATE TABLE applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    application_type_id TEXT REFERENCES application_types(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUTOS
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    reference TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    availability TEXT DEFAULT 'consult',
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    is_consult_only BOOLEAN DEFAULT false,
    main_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELAS ASSOCIATIVAS
CREATE TABLE product_segments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    segment_id TEXT NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, segment_id)
);

CREATE TABLE product_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, application_id)
);

CREATE TABLE product_specifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE product_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    url TEXT NOT NULL,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stock_movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_reference ON products(reference);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_is_active ON products(is_active);

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
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PÚBLICAS
CREATE POLICY "pub_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "pub_segments" ON segments FOR SELECT USING (is_active = true);
CREATE POLICY "pub_brands" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "pub_app_types" ON application_types FOR SELECT USING (is_active = true);
CREATE POLICY "pub_apps" ON applications FOR SELECT USING (is_active = true);
CREATE POLICY "pub_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "pub_product_segments" ON product_segments FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));
CREATE POLICY "pub_product_apps" ON product_applications FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));
CREATE POLICY "pub_specs" ON product_specifications FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));
CREATE POLICY "pub_docs" ON product_documents FOR SELECT USING (product_id IN (SELECT id FROM products WHERE is_active = true));
CREATE POLICY "pub_stock" ON stock_movements FOR SELECT USING (false);

-- POLÍTICAS ADMIN
CREATE POLICY "admin_all_categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_segments" ON segments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_brands" ON brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_app_types" ON application_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_apps" ON applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_product_segments" ON product_segments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_product_apps" ON product_applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_specs" ON product_specifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_docs" ON product_documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_stock" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');

-- SEED CATEGORIAS
INSERT INTO categories (id, name, slug, description, short_name, icon, sort_order, is_active) VALUES
('coleta', 'Coleta e Acondicionamento', 'coleta-acondicionamento', 'Tubos de coleta, agulhas, sistemas a vácuo', 'Coleta', 'TestTube', 1, true),
('equipamentos', 'Equipamentos Laboratoriais', 'equipamentos-laboratoriais', 'Centrífugas, microscópios, agitadores', 'Equipamentos', 'FlaskConical', 2, true),
('reagentes', 'Reagentes e Kits', 'reagentes-kits', 'Reagentes para análises clínicas', 'Reagentes', 'Beaker', 3, true),
('diagnostico', 'Diagnóstico in vitro', 'diagnostico-in-vitro', 'Testes rápidos e diagnósticos', 'IVD', 'ClipboardList', 4, true),
('microbiologia', 'Microbiologia', 'microbiologia', 'Meios de cultura e microbiologia', 'Microbiologia', 'CircleDot', 5, true),
('hematologia', 'Hematologia e Bioquímica', 'hematologia-bioquimica', 'Reagentes hematológicos', 'Hematologia', 'HeartPulse', 6, true),
('vidrarias', 'Vidrarias', 'vidrarias', 'Tubos, frascos, pipetas', 'Vidrarias', 'Beaker', 7, true),
('microscopia', 'Microscopia', 'microscopia', 'Microscópios e acessórios', 'Microscopia', 'Microscope', 8, true),
('armazenamento', 'Armazenamento', 'armazenamento', 'Freezers e refrigeradores', 'Armazenamento', 'Archive', 9, true),
('biosseguranca', 'Biossegurança', 'biosseguranca', 'EPIs e equipamentos de proteção', 'Biossegurança', 'Shield', 10, true);

-- SEED SEGMENTOS
INSERT INTO segments (id, name, slug, description, sort_order, is_active) VALUES
('laboratorial', 'Laboratório Clínico', 'laboratorio-clinico', 'Laboratórios de análises clínicas', 1, true),
('hospitalar', 'Hospitalar', 'hospitalar', 'Hospitais e unidades de saúde', 2, true),
('veterinario', 'Veterinário', 'veterinario', 'Clínicas veterinárias', 3, true),
('pesquisa', 'Pesquisa', 'pesquisa', 'Institutos de pesquisa', 4, true),
('universitario', 'Universitário', 'universitario', 'Universidades', 5, true),
('industrial', 'Industrial', 'industrial', 'Indústrias', 6, true);

-- SEED MARCAS
INSERT INTO brands (id, name, slug, description, sort_order, is_active) VALUES
('labtech-essentials', 'LabTech Essentials', 'labtech-essentials', 'Linha essencial', 1, true),
('labtech-pro', 'LabTech Pro', 'labtech-pro', 'Linha profissional', 2, true),
('labtech-instruments', 'LabTech Instruments', 'labtech-instruments', 'Instrumentos', 3, true),
('labtech-diagnostics', 'LabTech Diagnostics', 'labtech-diagnostics', 'Diagnósticos', 4, true),
('optiview', 'OptiView', 'optiview', 'Microscopia', 5, true);

-- SEED TIPOS DE APLICAÇÃO
INSERT INTO application_types (id, name, slug, description, sort_order, is_active) VALUES
('hematologia', 'Hematologia', 'hematologia', 'Análises hematológicas', 1, true),
('bioquimica', 'Bioquímica', 'bioquimica', 'Análises bioquímicas', 2, true),
('imunologia', 'Imunologia', 'imunologia', 'Análises imunológicas', 3, true),
('microbiologia', 'Microbiologia', 'microbiologia', 'Microbiologia', 4, true),
('centrifugacao', 'Centrifugação', 'centrifugacao', 'Centrifugação', 5, true),
('diagnostico', 'Diagnóstico', 'diagnostico', 'Diagnóstico clínico', 6, true);

-- SEED APLICAÇÕES
INSERT INTO applications (id, name, slug, description, application_type_id, sort_order, is_active) VALUES
('coleta-amostras', 'Coleta de Amostras', 'coleta-amostras', 'Coleta de amostras', 'diagnostico', 1, true),
('centrifugacao', 'Centrifugação', 'centrifugacao', 'Separação', 'centrifugacao', 2, true),
('hematologia-analise', 'Hematologia', 'hematologia-analise', 'Análises hematológicas', 'hematologia', 3, true),
('bioquimica-analise', 'Bioquímica', 'bioquimica-analise', 'Análises bioquímicas', 'bioquimica', 4, true),
('microbiologia-analise', 'Microbiologia', 'microbiologia-analise', 'Microbiologia', 'microbiologia', 5, true),
('diagnostico-rapido', 'Diagnóstico Rápido', 'diagnostico-rapido', 'Testes rápidos', 'diagnostico', 6, true);

-- SEED PRODUTOS
INSERT INTO products (id, name, slug, reference, short_description, description, category_id, brand_id, is_active, is_featured, is_new, availability, stock_quantity, minimum_stock) VALUES
('p001', 'Tubo de Coleta a Vácuo', 'tubo-coleta-vacuo', 'TCV-001', 'Tubo de vidro com ativador de coágulo', 'Tubo de coleta a vácuo para sangue venoso', 'coleta', 'labtech-essentials', true, true, false, 'consult', 1000, 100),
('p002', 'Agulha para Coleta 21G', 'agulha-coleta-21g', 'ACS-021', 'Agulha descartável para coleta', 'Agulha de aço inoxidável 21G', 'coleta', 'labtech-essentials', true, false, false, 'consult', 500, 50),
('p003', 'Sistema de Coleta Integrado', 'sistema-coleta-integrado', 'SCI-001', 'Sistema completo para coleta', 'Sistema de coleta a vácuo', 'coleta', 'labtech-pro', true, true, false, 'consult', 200, 30),
('p004', 'Tubo EDTA K2 3mL', 'tubo-edta-k2', 'TEDTA-003', 'Tubo com anticoagulante EDTA', 'Tubo de coleta com EDTA K2', 'coleta', 'labtech-essentials', true, false, false, 'in-stock', 800, 100),
('p005', 'Centrífuga de Mesa 24 Tubos', 'centrifuga-mesa-24', 'CM-2400', 'Centrífuga para 24 tubos', 'Centrífuga 300-6000 RPM', 'equipamentos', 'labtech-instruments', true, true, true, 'consult', 15, 3),
('p006', 'Microscópio Biológico Invertido', 'microscopio-invertido', 'MBI-001', 'Microscópio invertido', 'Microscópio para cultura celular', 'equipamentos', 'optiview', true, true, false, 'consult', 8, 2),
('p007', 'Agitador Orbital com Incubação', 'agitador-orbital', 'AOI-200', 'Agitador com temperatura', 'Agitador 25-500 RPM', 'equipamentos', 'labtech-instruments', true, false, true, 'consult', 10, 2),
('p008', 'Reagente Glucose Enzimático', 'reagente-glucose', 'RGL-001', 'Kit para glicose', 'Reagente GOD-PAP', 'reagentes', 'labtech-diagnostics', true, true, false, 'in-stock', 150, 20),
('p009', 'Kit Hemoglobina Glicada', 'kit-hba1c', 'KHBA-001', 'Kit HbA1c', 'Kit imunoturbidimétrico', 'reagentes', 'labtech-diagnostics', true, true, true, 'consult', 50, 10),
('p010', 'Kit Perfil Lipídico', 'kit-lipidico', 'KPL-001', 'Kit colesterol e triglicerídeos', 'Kit para perfil lipídico', 'reagentes', 'labtech-diagnostics', true, false, false, 'in-stock', 80, 15);

-- SEED RELAÇÕES
INSERT INTO product_segments (product_id, segment_id) VALUES
('p001', 'laboratorial'), ('p001', 'hospitalar'),
('p002', 'laboratorial'), ('p002', 'hospitalar'),
('p003', 'laboratorial'), ('p003', 'hospitalar'),
('p004', 'laboratorial'), ('p004', 'hospitalar'),
('p005', 'laboratorial'), ('p005', 'hospitalar'), ('p005', 'pesquisa'),
('p006', 'laboratorial'), ('p006', 'pesquisa'),
('p007', 'laboratorial'), ('p007', 'pesquisa'),
('p008', 'laboratorial'), ('p008', 'hospitalar'),
('p009', 'laboratorial'), ('p009', 'hospitalar'),
('p010', 'laboratorial'), ('p010', 'hospitalar');

INSERT INTO product_applications (product_id, application_id) VALUES
('p001', 'coleta-amostras'),
('p004', 'coleta-amostras'), ('p004', 'hematologia-analise'),
('p005', 'centrifugacao'),
('p006', 'hematologia-analise'),
('p007', 'microbiologia-analise'),
('p008', 'bioquimica-analise'),
('p009', 'hematologia-analise'), ('p009', 'bioquimica-analise'),
('p010', 'bioquimica-analise');

-- SPECS
INSERT INTO product_specifications (product_id, label, value, sort_order) VALUES
('p001', 'Volume', '5 mL', 1), ('p001', 'Material', 'Vidro borossilicato', 2), ('p001', 'Tampa', 'Vermelha', 3),
('p005', 'Capacidade', '24 x 15 mL', 1), ('p005', 'Velocidade', '300-6000 RPM', 2), ('p005', 'Timer', '0-99 min', 3),
('p008', 'Método', 'GOD-PAP', 1), ('p008', 'Linearidade', '5-500 mg/dL', 2);

-- STORAGE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "pub_storage" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "admin_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "admin_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
