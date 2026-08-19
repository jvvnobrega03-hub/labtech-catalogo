-- ============================================
-- MIGRAÇÃO DOS PRODUTOS EXISTENTES
-- ============================================

-- Inserir produtos do catálogo atual
INSERT INTO products (id, name, slug, reference, short_description, description, category_id, brand_id, is_active, is_featured, is_new, availability, stock_quantity, minimum_stock, keywords, main_image_url, created_at, updated_at) VALUES
-- Coleta e Acondicionamento
('p001', 'Tubo de Coleta a Vácuo com Ativador de Coágulo', 'tubo-coleta-vacuo-seringa', 'TCV-001', 'Tubo de vidro com ativador de coágulo para coleta de sangue venoso', 'Tubo de coleta a vácuo desenvolvido para coleta de amostras de sangue venoso. O ativador de coágulo permite a formação adequada do coágulo para obtenção de soro de qualidade. Tampa de borracha siliconizada para melhor vedação. Volume de 5ml, dimensões padronizadas para uso em laboratórios clínicos.', 'coleta', 'labtech-essentials', true, true, false, 'consult', 1000, 100, ARRAY['tubo', 'coleta', 'vacuo', 'sangue', 'coagulo', 'sorologia'], '/products/tube-01.svg', NOW(), NOW()),
('p002', 'Agulha para Coleta de Sangue 21G', 'agulha-coleta-sangue-21g', 'ACS-021', 'Agulha descartável para coleta de sangue venoso com bisel trifacetado', 'Agulha de aço inoxidável descartável com bisel trifacetado para coleta de sangue venoso. Conexão padrão Luer Lock para adaptação aTubos de coleta a vácuo. Siliconizada para inserção painless. Embalagem individual estéril.', 'coleta', 'labtech-essentials', true, false, false, 'consult', 500, 50, ARRAY['agulha', 'coleta', 'sangue', '21g', 'descartavel'], '/products/needle-01.svg', NOW(), NOW()),
('p003', 'Sistema de Coleta a Vácuo Integrado', 'sistema-coleta-vacuo-integrado', 'SCI-001', 'Sistema completo para coleta de sangue com holder e agulha', 'Sistema de coleta a vácuo integrado contendo holder para Tubes e agulha dupla face. Design ergonômico para melhor conforto durante a coleta. Mecanismo de segurança que cobre a agulha após uso. Kit completo para coleta padrão.', 'coleta', 'labtech-pro', true, true, false, 'consult', 200, 30, ARRAY['sistema', 'coleta', 'vacuo', 'holder', 'agulha', 'kit'], '/products/collection-kit.svg', NOW(), NOW()),
('p004', 'Tubo EDTA K2 3mL', 'tubo-edta-k2-3ml', 'TEDTA-003', 'Tubo com anticoagulante EDTA para hemograma e citometria', 'Tubo de coleta a vácuo com anticoagulante EDTA K2 para preservação de amostras de sangue total. Indicado para hemogramas, contagem de células, citometria de fluxo e testes de coagulação. Tampa roxa com identificação clara.', 'coleta', 'labtech-essentials', true, false, false, 'in-stock', 800, 100, ARRAY['tubo', 'edta', 'k2', 'hemograma', 'sangue', 'anticoagulante'], '/products/tube-edta.svg', NOW(), NOW()),

-- Equipamentos Laboratoriais
('p005', 'Centrífuga de Mesa para 24 Tubos', 'centrifuga-mesa-24-tubos', 'CM-2400', 'Centrífuga de laboratório com capacidade para 24 tubos de 15mL', 'Centrífuga de mesa de uso geral com capacidade para 24 Tubes de 15mL ou 48 Tubes de 1.5mL. Motor sem escovas de manutenção reduzida. Velocidade ajustável de 300 a 6000 RPM. Display digital com programação de tempo e velocidade. Tampa com sistema de segurança.', 'equipamentos', 'labtech-instruments', true, true, true, 'consult', 15, 3, ARRAY['centrifuga', 'mesa', 'laboratorio', 'tubos', 'separacao'], '/products/centrifuge.svg', NOW(), NOW()),
('p006', 'Microscópio Biológico Invertido', 'microscopio-biologico-invertido', 'MBI-001', 'Microscópio invertido para cultura celular com contraste de fase', 'Microscópio biológico invertido para observação de culturas celulares em frascos e placas. Sistema de contraste de fase integrado. Objetivos de longo trabalho para observação em caixas de cultura. Iluminação LED economizadora. Câmera digital opcional para documentação.', 'equipamentos', 'optiview', true, true, false, 'consult', 8, 2, ARRAY['microscopio', 'invertido', 'celula', 'cultura', 'contraste'], '/products/microscope-inverted.svg', NOW(), NOW()),
('p007', 'Agitador Orbitalshake com Incubação', 'agitador-orbital-shaker', 'AOI-200', 'Agitador orbital com temperatura controlada para cultivo', 'Agitador orbital shake com incubação para culturas de microorganisms e células. Faixa de temperatura ambiente +5°C a 80°C. Velocidade ajustável de 25 a 500 RPM. Plataforma com capacidade parafrascos de 250mL a 2L. Display digital com programação.', 'equipamentos', 'labtech-instruments', true, false, true, 'consult', 10, 2, ARRAY['agitador', 'orbital', 'shake', 'incubacao', 'cultura'], '/products/shaker.svg', NOW(), NOW()),

-- Reagentes e Kits
('p008', 'Reagente para Dosagem de Glucose - Método Enzimático', 'reagente-glucose-enzimatico', 'RGL-001', 'Kit enzimático para determinação de glicose no soro/plasma', 'Reagente líquido pronto uso para determinação quantitativa de glicose em soro, plasma ou urina. Método enzimático GOD-PAP com alta especificidade. Linearidade até 500 mg/dL. Compatível com analisadores automáticos e métodos manuais. Formato de 250 determinações.', 'reagentes', 'labtech-diagnostics', true, true, false, 'in-stock', 150, 20, ARRAY['reagente', 'glucose', 'glicose', 'enzimatico', 'bioquimica'], '/products/reagent.svg', NOW(), NOW()),
('p009', 'Kit para Dosagem de Hemoglobina Glicada (HbA1c)', 'kit-hemoglobina-glicada', 'KHBA-001', 'Kit imunoturbidimétrico para determinação de HbA1c', 'Kit para determinação quantitativa de hemoglobina glicada (HbA1c) em sangue total. Método imunoturbidimétrico sem interferência de variantes de hemoglobina. Calibração rastreável ao NGSP. Resultados em percentage e IFCC. Compatível com analisador automático.', 'reagentes', 'labtech-diagnostics', true, true, true, 'consult', 50, 10, ARRAY['hemoglobina', 'glicada', 'hba1c', 'diabetes', 'kit'], '/products/kit-hba1c.svg', NOW(), NOW()),
('p010', 'Kit Perfil Lipídico Completo', 'kit-perfil-lipidico', 'KPL-001', 'Kit para dosagem de colesterol total, HDL, LDL e triglicerídeos', 'Kit completo para determinação do perfil lipídico: colesterol total, HDL-colesterol, LDL-colesterol e triglicerídeos. Reagentes líquidos prontos uso. Sem necessidade de precipitação para HDL. Linearidades adequadas para interpretação clínica. Formato económico para laboratório de alto volume.', 'reagentes', 'labtech-diagnostics', true, false, false, 'in-stock', 80, 15, ARRAY['lipidico', 'colesterol', 'hdl', 'ldl', 'triglicerideos'], '/products/kit-lipid.svg', NOW(), NOW()),

-- Diagnóstico in vitro
('p011', 'Teste Rápido para Dengue NS1', 'teste-rapido-dengue', 'TRD-001', 'Teste imunocromatográfico para detecção de dengue NS1', 'Teste rápido para detecção qualitativa da proteína NS1 do vírus da dengue em soro, plasma ou sangue total. Resultado em 15-20 minutos. Sensibilidade >95% para infecções primárias. Util em fase precoce da infecção. Formato individual包装.', 'diagnostico', 'labtech-diagnostics', true, true, false, 'in-stock', 300, 50, ARRAY['dengue', 'ns1', 'rapido', 'teste', 'diagnostico'], '/products/rapid-test.svg', NOW(), NOW()),
('p012', 'Teste Rápido COVID-19 Antígeno', 'teste-rapido-covid-19-antigenio', 'TRC-001', 'Teste imunocromatográfico para detecção de antígeno SARS-CoV-2', 'Teste rápido para detecção qualitativa de antígeno do SARS-CoV-2 em amostras de swab nasal. Resultado em 15 minutos. Alta especificidade para variantes known. Registro ANVISA. Formato individual com dispositivo de coleta integrado.', 'diagnostico', 'labtech-diagnostics', true, true, false, 'in-stock', 500, 100, ARRAY['covid', 'antigenio', 'rapido', 'teste', 'coronavirus'], '/products/covid-test.svg', NOW(), NOW()),
('p013', 'Teste Rápido de Gravidez hCG', 'teste-rapido-gravidez', 'TRG-001', 'Teste imunocromatográfico para detecção de hCG', 'Teste rápido para detecção qualitativa do hormônio hCG em urina ou soro. Alta sensibilidade para detecção precoce de gravidez. Resultado em 3-5 minutos. Formato cassette com alta precisão. Sensibilidade de 25 mUI/mL.', 'diagnostico', 'labtech-diagnostics', true, false, false, 'in-stock', 400, 80, ARRAY['gravidez', 'hcg', 'rapido', 'teste', 'gravida'], '/products/pregnancy-test.svg', NOW(), NOW()),

-- Microbiologia
('p014', 'Ágar Sangue - Meio de Cultura', 'meio-cultura-agar-sangue', 'MCS-001', 'Meio de cultura para isolamento de bactérias fastidiosas', 'Ágar sangue é um meio de cultura rico para isolamento e cultivo de bactérias fastidiosas. Suplementado com 5% de sangue de carneiro. Permite verificação de hemólise. Indicado para microbiologia clínica e de alimentos. Placas de 90mm prontas para uso.', 'microbiologia', 'labtech-microbiology', true, false, false, 'in-stock', 200, 30, ARRAY['meio', 'cultura', 'agar', 'sangue', 'microbiologia'], '/products/agar-blood.svg', NOW(), NOW()),
('p015', 'Kit de Identificação Bioquímica para Bactérias', 'kit-identificacao-bacterias', 'KIB-001', 'Painel de testes bioquímicos para identificação de enterobactérias', 'Kit para identificação de enterobactérias e outras enterobactérias Gram-negativas. Inclui 12 testes bioquímicos em formato de túneis miniaturizados. Leitura visual ou automatizada. Banco de dados atualizado. Para 50 testes.', 'microbiologia', 'labtech-microbiology', true, false, true, 'consult', 25, 5, ARRAY['identificacao', 'bacteria', 'bioquimico', 'kit', 'enterobacteria'], '/products/biochem-test.svg', NOW(), NOW()),
('p016', 'Kit Coloração de Gram', 'reagente-coloracao-gram', 'KCG-001', 'Kit para coloração de Gram em esfregaços bacterianos', 'Kit completo para técnica de coloração de Gram. Contém cristal violeta, lugol, álcool-acetona e safranina. Procedimento padronizado para diferenciação de bactérias Gram-positivas e Gram-negativas. Rendimento de 100 lâminas.', 'microbiologia', 'labtech-microbiology', true, false, false, 'in-stock', 120, 20, ARRAY['gram', 'coloracao', 'bacteria', 'kit', 'microscopia'], '/products/gram-stain.svg', NOW(), NOW()),

-- Vidrarias
('p017', 'Pipeta Volumétrica Classe A - 10mL', 'pipeta-volumetrica-10ml', 'PV-010', 'Pipeta volumétrica de vidro classe A com certificado', 'Pipeta volumétrica de vidro borossilicato classe A com tolerance especificada. Marcação em azul permanente. Uma marca (toque). Certificado de calibração individual incluso. Conforme normas ISO 648 e ABNT NBR ISO 648.', 'vidrarias', 'labtech-glass', true, false, false, 'in-stock', 150, 25, ARRAY['pipeta', 'volumetrica', 'vidro', 'classe-a', '10ml'], '/products/pipette.svg', NOW(), NOW()),
('p018', 'Balão Volumétrico Classe A - 100mL', 'balao-volumetrico-100ml', 'BV-100', 'Balão volumétrico de vidro com tampa de polipropileno', 'Balão volumétrico de vidro borossilicato classe A com tampa de polipropileno. Alta precisão para preparo de soluções. Marcação em azul permanente. Conforme especificações ASTM E288 e ISO 1042. Certificado de calibração disponível.', 'vidrarias', 'labtech-glass', true, false, false, 'in-stock', 100, 20, ARRAY['balao', 'volumetrico', 'vidro', '100ml', 'solucao'], '/products/flask.svg', NOW(), NOW()),
('p019', 'Conta Gotas (Gotejador) de Vidro', 'conta-gotas-gotero-vidro', 'CGV-001', 'Gotejador de vidro com pipeta e tubo de borracha', 'Conta gotas de vidro borossilicato com tubo de borracha e pino de vidro. Para transferência de líquidos em pequenas quantidades. Tampa rosqueável. Resistência química adequada para maioria dos reagentes. Tamanho padrão de 30mL.', 'vidrarias', 'labtech-glass', true, false, false, 'in-stock', 80, 15, ARRAY['conta', 'gotas', 'gotejador', 'vidro', 'transferencia'], '/products/dropper.svg', NOW(), NOW()),

-- Microscopia
('p020', 'Microscópio de Luz Binocular LED', 'microscopio-luz-binocular', 'MLB-001', 'Microscópio biológico binocular com iluminação LED e objetivas planas', 'Microscópio biológico binocular de uso geral com objetivas planas acromáticas. Iluminação LED com ajuste de brilho. Platina com comandos cruzados. Oculares de campo amplo. Revólver quádruplo. Ideal para ensino e laboratório clínico básico.', 'microscopia', 'optiview', true, true, false, 'consult', 12, 3, ARRAY['microscopio', 'luz', 'binocular', 'led', 'biologico'], '/products/microscope-light.svg', NOW(), NOW()),
('p021', 'Lâmina para Microscopia - Padrão', 'lamina-microscopia-padrao', 'LMP-001', 'Lâmina de vidro para microscopia com borda lapidada', 'Lâmina de microscopia em vidro sodocálcico com bordas lapidadas. Dimensões 76 x 26mm. Espessura 1.0-1.2mm. Faces polidas para melhor aderência de amostras. Embalagem com 50 unidades. Não estéril.', 'microscopia', 'labtech-glass', true, false, false, 'in-stock', 500, 80, ARRAY['lamina', 'microscopia', 'vidro', 'padrao', 'esfregaco'], '/products/slide.svg', NOW(), NOW()),
('p022', 'Lâmina com Cavidade', 'lamina-cavidade', 'LCV-001', 'Lâmina de microscopia com cavidade central para gotas pendentes', 'Lâmina de microscopia com cavidade central (well) para técnica de gota pendente. Permite observação de microorganismos vivos semcoloração. Cavidade de 15mm de diâmetro. Bordas lapidadas. Embalagem com 50 unidades.', 'microscopia', 'labtech-glass', true, false, false, 'in-stock', 200, 40, ARRAY['lamina', 'cavidade', 'microscopia', 'pendente', 'vivo'], '/products/slide-cavity.svg', NOW(), NOW()),

-- Armazenamento
('p023', 'Freezer de Laboratório -80°C', 'freezer-laboratorial-80c', 'FL-080', 'Freezer ultrafrio para armazenamento de amostras biológicas', 'Freezer de laboratório para temperatura ultralow de -80°C. Ideal para armazenamento de amostras biológicas, DNA, RNA, proteínas e vacais. Sistema de refrigeração cascade. Display digital com alarme. Capacidade de 300 litros. Estrutura em aço inox.', 'armazenamento', 'labtech-cold', true, true, true, 'consult', 5, 1, ARRAY['freezer', 'ultrafrio', '-80', 'amostras', 'biologico'], '/products/freezer.svg', NOW(), NOW()),
('p024', 'Refrigerador de Laboratório 2-8°C', 'refrigerador-laboratorial-4c', 'RL-004', 'Refrigerador para armazenamento de reagentes e amostras', 'Refrigerador de laboratório com temperatura controlada de 2-8°C. Ideal para armazenamento de reagentes, kits diagnósticos e amostras. Display digital com alarme de temperatura. prateleiras ajustáveis. Porta com fechamento automático.', 'armazenamento', 'labtech-cold', true, false, false, 'consult', 8, 2, ARRAY['refrigerador', 'laboratorio', '2-8', 'reagentes'], '/products/refrigerator.svg', NOW(), NOW()),
('p025', 'Caixa de Isopor para Criogenia', 'caixa-isopor-criogenica', 'CIC-001', 'Caixa de isopor para transporte de amostras em nitrogênio líquido', 'Caixa de isopor para armazenamento e transporte de amostras em vapor de nitrogênio líquido. Mantém temperaturas criogênicas por até 10 dias. Indicada para transporte de materiais biológicos. Alças para transporte. Disponível em vários tamanhos.', 'armazenamento', 'labtech-cold', true, false, false, 'in-stock', 60, 10, ARRAY['caixa', 'isopor', 'criogenia', 'nitrogenio', 'transporte'], '/products/cryobox.svg', NOW(), NOW()),

-- Biossegurança
('p026', 'Luvas de Procedimento - Nitrilo', 'luva-procedimento-nitrile', 'LPN-001', 'Luvas descartáveis de nitrilo sem pó, azul', 'Luvas de procedimento descartáveis em nitrilo sem pó. Ambidestras. Não estéreis. Poets livres de látex - alternativa segura para alérgicos. TEXTURIZADAS nas pontas dos dedos para melhor sensibilidade. Azul royal.', 'biosseguranca', 'labtech-protection', true, false, false, 'in-stock', 2000, 300, ARRAY['luva', 'nitrilo', 'procedimento', 'descartavel', 'sem-po'], '/products/gloves.svg', NOW(), NOW()),
('p027', 'Macacão Descartável Tipo Tyvek', 'macacao-descartavel-tipo-tyvek', 'MDT-001', 'Macacão de proteção descartável em material Tyvek', 'Macacão descartável de proteção em material Tyvek. Leve, respirável e resistente a respingos. Capuz integrado. Elástico em tornozelos e pulsos. Zíper frontal. Ideal para áreas de biossegurança e manipulação de materiais.', 'biosseguranca', 'labtech-protection', true, false, false, 'in-stock', 150, 25, ARRAY['macacao', 'tyvek', 'descartavel', 'protecao', 'biosseguranca'], '/products/tyvek-suit.svg', NOW(), NOW()),
('p028', 'Óculos de Proteção Laboral', 'oculos-protecao-laboratorio', 'OPL-001', 'Óculos de proteção com lente antiembaçante', 'Óculos de proteção laboral com lente de policarbonato. Tratamento antiembaçante e antirisco. Design envolvente para proteção lateral. Hastes ajustáveis. Proteção UV400. Certificação ANSI Z87.1.', 'biosseguranca', 'labtech-protection', true, false, false, 'in-stock', 120, 20, ARRAY['oculos', 'protecao', 'laboratorio', 'seguranca', 'antiembacante'], '/products/safety-glasses.svg', NOW(), NOW()),
('p029', 'Autoclave de Mesa 18L', 'autoclave-mesa-18l', 'AM-018', 'Autoclave vertical de mesa para esterilização a vapor', 'Autoclave de mesa para esterilização por vapor saturado sob pressão. Capacidade de 18 litros. Programa automático para instrumentos, materiais de laboratório e resíduos. Secagem automática. Display digital. Segurança máxima com多重proteção.', 'biosseguranca', 'labtech-instruments', true, true, true, 'consult', 6, 1, ARRAY['autoclave', 'esterilizacao', 'vapor', 'mesa', '18l'], '/products/autoclave.svg', NOW(), NOW()),
('p030', 'Cabine de Segurança Biológica Classe II Tipo A2', 'cabine-seguranca-classe-ii', 'CSB-002', 'Cabine de segurança para manipulação de agentes biológicos', 'Cabine de segurança biológica Classe II Tipo A2 para manipulação de agentes biológicos classes I, II e III. Fluxo laminar descendente comexaustão filtrada HEPA. Proteção do operador, produto e ambiente. Display Touch com monitoramento em tempo real.', 'biosseguranca', 'labtech-protection', true, true, false, 'consult', 3, 1, ARRAY['cabine', 'seguranca', 'biologica', 'hepa', 'fluxo laminar'], '/products/biosafety-cabinet.svg', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir especificações dos produtos
INSERT INTO product_specifications (product_id, label, value, sort_order) VALUES
-- Produto 1
('p001', 'Volume', '5 mL', 1),
('p001', 'Material', 'Vidro borossilicato', 2),
('p001', 'Tampa', 'Vermelha (ativa coágulo)', 3),
('p001', 'Dimensões', '13 x 100 mm', 4),
('p001', 'Estéril', 'Sim', 5),
('p001', 'Quantidade', '100 unidades', 6),
-- Produto 2
('p002', 'Calibre', '21G (0.8 mm)', 1),
('p002', 'Comprimento', '38 mm', 2),
('p002', 'Material', 'Aço inoxidável', 3),
('p002', 'Conexão', 'Luer Lock', 4),
('p002', 'Esterilização', 'Óxido de etileno', 5),
('p002', 'Quantidade', '100 unidades', 6),
-- Produto 3
('p003', 'Composição', 'Holder + Agulha 21G', 1),
('p003', 'Material Holder', 'Polipropileno', 2),
('p003', 'Agulha', 'Aço inoxidável 21G', 3),
('p003', 'Segurança', 'Ativação por pressão', 4),
('p003', 'Esterilização', 'Óxido de etileno', 5),
('p003', 'Quantidade', '50 kits', 6),
-- Produto 4
('p004', 'Volume', '3 mL', 1),
('p004', 'Material', 'Vidro borossilicato', 2),
('p004', 'Anticoagulante', 'EDTA K2', 3),
('p004', 'Tampa', 'Roxa (K2)', 4),
('p004', 'Dimensões', '13 x 75 mm', 5),
('p004', 'Quantidade', '100 unidades', 6),
-- Produto 5
('p005', 'Capacidade', '24 x 15 mL / 48 x 1.5 mL', 1),
('p005', 'Velocidade', '300 - 6000 RPM', 2),
('p005', 'Força Centrífuga', '4000 x g', 3),
('p005', 'Timer', '0-99 min', 4),
('p005', 'Motor', 'Sem escovas', 5),
('p005', 'Dimensões', '38 x 42 x 28 cm', 6),
-- Produto 6
('p006', 'Tipo', 'Invertido', 1),
('p006', 'Objetivos', '4x, 10x, 20x, 40x', 2),
('p006', 'Contraste', 'Fase (incluído)', 3),
('p006', 'Iluminação', 'LED', 4),
('p006', 'Câmera', 'Opcional 5MP', 5),
('p006', 'Campo', 'Fosfeto branco', 6),
-- Produto 7
('p007', 'Tipo', 'Orbital', 1),
('p007', 'Temperatura', 'Ambiente +5°C a 80°C', 2),
('p007', 'Velocidade', '25 - 500 RPM', 3),
('p007', 'Plataforma', '30 x 30 cm', 4),
('p007', 'Capacidade', '6 frascos de 500mL', 5),
('p007', 'Timer', '0-999 min', 6),
-- Produto 8
('p008', 'Método', 'GOD-PAP (Enzimático)', 1),
('p008', 'Linearidade', '5 - 500 mg/dL', 2),
('p008', 'Comprimento de onda', '505 nm', 3),
('p008', 'Volume de reação', '1000 μL', 4),
('p008', 'Temperatura', '37°C / Room temp', 5),
('p008', 'Determinações', '250', 6),
-- Produto 9
('p009', 'Método', 'Imunoturbidimetria', 1),
('p009', 'Amostra', 'Sangue total EDTA', 2),
('p009', 'Volume', '10 μL', 3),
('p009', 'Resultado', '% e mmol/mol', 4),
('p009', 'Calibração', 'NGSP traceável', 5),
('p009', 'Determinações', '100', 6),
-- Produto 10
('p010', 'Parâmetros', 'CT, HDL, LDL, TG', 1),
('p010', 'HDL', 'Homogêneo sem precipitação', 2),
('p010', 'LDL', 'Cálculo direto', 3),
('p010', 'Linearidade CT', '5 - 600 mg/dL', 4),
('p010', 'Temperatura', '37°C', 5),
('p010', 'Determinações', '200', 6)
ON CONFLICT DO NOTHING;

-- Inserir relações produto-segmentos (alguns produtos têm múltiplos segmentos)
INSERT INTO product_segments (product_id, segment_id) VALUES
-- Produtos de coleta
('p001', 'laboratorial'),
('p001', 'hospitalar'),
('p002', 'laboratorial'),
('p002', 'hospitalar'),
('p003', 'laboratorial'),
('p003', 'hospitalar'),
('p004', 'laboratorial'),
('p004', 'hospitalar'),
-- Equipamentos
('p005', 'laboratorial'),
('p005', 'hospitalar'),
('p005', 'pesquisa'),
('p006', 'laboratorial'),
('p006', 'pesquisa'),
('p007', 'laboratorial'),
('p007', 'pesquisa'),
-- Reagentes
('p008', 'laboratorial'),
('p008', 'hospitalar'),
('p009', 'laboratorial'),
('p009', 'hospitalar'),
('p010', 'laboratorial'),
('p010', 'hospitalar'),
-- Diagnóstico
('p011', 'laboratorial'),
('p011', 'hospitalar'),
('p012', 'laboratorial'),
('p012', 'hospitalar'),
('p013', 'laboratorial'),
('p013', 'hospitalar'),
-- Microbiologia
('p014', 'laboratorial'),
('p014', 'hospitalar'),
('p015', 'laboratorial'),
('p015', 'pesquisa'),
('p016', 'laboratorial'),
('p016', 'hospitalar'),
-- Vidrarias
('p017', 'laboratorial'),
('p017', 'pesquisa'),
('p018', 'laboratorial'),
('p018', 'pesquisa'),
('p019', 'laboratorial'),
-- Microscopia
('p020', 'laboratorial'),
('p020', 'hospitalar'),
('p020', 'pesquisa'),
('p021', 'laboratorial'),
('p021', 'hospitalar'),
('p021', 'pesquisa'),
('p022', 'laboratorial'),
('p022', 'pesquisa'),
-- Armazenamento
('p023', 'laboratorial'),
('p023', 'hospitalar'),
('p023', 'pesquisa'),
('p024', 'laboratorial'),
('p024', 'hospitalar'),
('p025', 'laboratorial'),
('p025', 'hospitalar'),
('p025', 'pesquisa'),
-- Biossegurança
('p026', 'laboratorial'),
('p026', 'hospitalar'),
('p027', 'laboratorial'),
('p027', 'hospitalar'),
('p027', 'pesquisa'),
('p028', 'laboratorial'),
('p028', 'hospitalar'),
('p029', 'laboratorial'),
('p029', 'hospitalar'),
('p030', 'laboratorial'),
('p030', 'hospitalar'),
('p030', 'pesquisa')
ON CONFLICT DO NOTHING;

-- Inserir relações produto-aplicações
INSERT INTO product_applications (product_id, application_id) VALUES
('p001', 'coleta-amostras'),
('p001', 'analises-clinicas'),
('p002', 'coleta-amostras'),
('p003', 'coleta-amostras'),
('p003', 'analises-clinicas'),
('p004', 'coleta-amostras'),
('p004', 'hematologia-analise'),
('p005', 'centrifugacao'),
('p005', 'preparacao-amostras'),
('p006', 'microscopia-analise'),
('p006', 'preparacao-amostras'),
('p007', 'microbiologia-analise'),
('p007', 'preparacao-amostras'),
('p008', 'bioquimica-analise'),
('p008', 'analises-clinicas'),
('p009', 'hematologia-analise'),
('p009', 'bioquimica-analise'),
('p010', 'bioquimica-analise'),
('p010', 'analises-clinicas'),
('p011', 'diagnostico-rapido'),
('p011', 'imunologia'),
('p012', 'diagnostico-rapido'),
('p012', 'imunologia'),
('p013', 'diagnostico-rapido'),
('p013', 'imunologia'),
('p014', 'microbiologia-analise'),
('p015', 'microbiologia-analise'),
('p016', 'microbiologia-analise'),
('p016', 'microscopia-analise'),
('p017', 'preparacao-amostras'),
('p018', 'preparacao-amostras'),
('p019', 'preparacao-amostras'),
('p020', 'microscopia-analise'),
('p021', 'microscopia-analise'),
('p022', 'microscopia-analise'),
('p022', 'microbiologia-analise'),
('p023', 'armazenamento-refrigerado'),
('p024', 'armazenamento-refrigerado'),
('p025', 'armazenamento-refrigerado'),
('p025', 'diagnostico-veterinario'),
('p026', 'diagnostico-veterinario'),
('p026', 'microbiologia-analise'),
('p027', 'biosseguranca'),
('p028', 'biosseguranca'),
('p029', 'biosseguranca'),
('p029', 'microbiologia-analise'),
('p030', 'biosseguranca'),
('p030', 'microbiologia-analise')
ON CONFLICT DO NOTHING;

-- Atualizar contadores de produtos nas categorias
UPDATE categories c SET
    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = true)
WHERE true;

-- Função para atualizar contador de produtos
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentário: Os contadores serão calculados dinamicamente via queries
-- não sendo necessário manter campos duplicados
