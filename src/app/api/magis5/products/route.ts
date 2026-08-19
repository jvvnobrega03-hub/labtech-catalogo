import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();

/**
 * Sincronização de produtos do Magis5/ERP
 * Usado para importar ou atualizar produtos do ERP para o catálogo
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Formatos possíveis:
    // Array de produtos: [{ "sku": "PROD-001", "nome": "Produto", ... }]
    // Objeto com data: { "data": [{ ... }] }
    // Objeto com produtos: { "produtos": [{ ... }] }

    const products = Array.isArray(body)
      ? body
      : body.data || body.produtos || body.products || [];

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products provided' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const item of products) {
      try {
        // Mapeia campos do Magis5/ERP para o formato do banco
        const reference = item.codigo || item.sku || item.reference || item.product_id;
        const name = item.nome || item.name || item.descricao || item.description;
        const shortDescription = item.descricao_curta || item.short_description || item.resumo || '';
        const description = item.descricao || item.description || item.descricao_completa || '';
        const price = item.preco || item.price || item.valor || 0;
        const categoryName = item.categoria || item.category || item.segmento || '';
        const brandName = item.marca || item.brand || item.fabricante || '';
        const images = item.imagens || item.images || item.fotos || [];
        const specifications = item.especificacoes || item.specifications || item.atributos || [];

        if (!reference || !name) {
          errors.push({
            item: reference || name || 'unknown',
            error: 'Missing reference or name'
          });
          continue;
        }

        // Gera slug a partir do nome
        const slug = (name as string)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');

        // Verifica se o produto já existe
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('reference', String(reference))
          .maybeSingle();

        // Processa imagens
        let mainImageUrl = '';
        let galleryUrls: string[] = [];

        if (images.length > 0) {
          mainImageUrl = images[0]?.url || images[0] || '';
          galleryUrls = images.slice(1).map((img: any) => img?.url || img);
        }

        // Processa especificações
        const processedSpecs = Array.isArray(specifications)
          ? specifications.map((spec: any, index: number) => ({
              label: spec.nome || spec.name || spec.label || '',
              value: spec.valor || spec.value || '',
              sort_order: index
            }))
          : [];

        const productData = {
          name: name as string,
          slug,
          reference: String(reference),
          short_description: shortDescription as string,
          description: description as string,
          price: parseFloat(price) || 0,
          main_image_url: mainImageUrl,
          gallery_urls: galleryUrls,
          keywords: item.palavras_chave || item.keywords || item.tags || [],
          is_active: item.ativo !== false && item.active !== false,
          is_featured: item.destaque || item.featured || false,
          is_new: item.novo || item.is_new || false,
          availability: item.estoque > 0 ? 'in-stock' : (item.consulta || item.consult_only ? 'consult' : 'out-of-stock'),
          stock_quantity: parseInt(item.estoque || item.stock || item.qtd || 0),
          minimum_stock: parseInt(item.estoque_minimo || item.min_stock || 0),
          updated_at: new Date().toISOString()
        };

        let result;

        if (existingProduct) {
          // Atualiza produto existente
          const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)
            .select()
            .single();

          if (error) throw error;

          result = {
            reference,
            status: 'updated',
            id: existingProduct.id
          };
        } else {
          // Cria novo produto
          const { data, error } = await supabase
            .from('products')
            .insert({
              id: crypto.randomUUID(),
              ...productData,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;

          result = {
            reference,
            status: 'created',
            id: data?.id
          };
        }

        // Processa categoria
        if (categoryName) {
          const categorySlug = (categoryName as string)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', categoryName as string)
            .maybeSingle();

          if (category) {
            await supabase
              .from('products')
              .update({ category_id: category.id })
              .eq('reference', String(reference));
          }
        }

        // Processa marca
        if (brandName) {
          const brandSlug = (brandName as string)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

          const { data: brand } = await supabase
            .from('brands')
            .select('id')
            .ilike('name', brandName as string)
            .maybeSingle();

          if (brand) {
            await supabase
              .from('products')
              .update({ brand_id: brand.id })
              .eq('reference', String(reference));
          }
        }

        // Salva especificações do produto
        if (processedSpecs.length > 0 && result.id) {
          // Remove especificações antigas
          await supabase
            .from('product_specifications')
            .delete()
            .eq('product_id', result.id);

          // Insere novas especificações
          await supabase
            .from('product_specifications')
            .insert(
              processedSpecs.map((spec: any) => ({
                product_id: result.id,
                label: spec.label,
                value: spec.value,
                sort_order: spec.sort_order || 0
              }))
            );
        }

        results.push(result);

      } catch (itemError: any) {
        errors.push({
          item: item.codigo || item.sku || 'unknown',
          error: itemError.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      errors: errors.length > 0 ? errors : undefined,
      results
    });

  } catch (error: any) {
    console.error('Erro ao sincronizar produtos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync products' },
      { status: 500 }
    );
  }
}

// GET retorna instruções de uso
export async function GET() {
  return NextResponse.json({
    endpoint: 'magis5/products',
    method: 'POST',
    description: 'Sincronização de produtos do Magis5/ERP para o catálogo',
    supportedFormats: {
      json: 'application/json'
    },
    expectedFields: {
      required: ['codigo', 'nome'],
      optional: [
        'descricao', 'descricao_curta', 'preco', 'categoria', 'marca',
        'imagens', 'especificacoes', 'estoque', 'estoque_minimo',
        'ativo', 'destaque', 'novo', 'palavras_chave', 'tags'
      ]
    },
    example: {
      "produtos": [
        {
          "codigo": "PROD-001",
          "nome": "Tubo de Coleta a Vácuo",
          "descricao": "Tubo de coleta para sangue venoso",
          "preco": 15.90,
          "categoria": "Coleta",
          "marca": "LabTech",
          "estoque": 100,
          "imagens": [
            { "url": "https://exemplo.com/img1.jpg" }
          ],
          "especificacoes": [
            { "nome": "Volume", "valor": "5mL" }
          ]
        }
      ]
    }
  });
}
