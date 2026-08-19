import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();

/**
 * Callback de estoque do Magis5
 * Recebe notificações de alteração de estoque do ERP via Magis5
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // O formato pode variar - adaptamos para diferentes estruturas
    // Exemplo: { "produto": { "codigo": "123", "estoque": 10 } }
    // ou: { "data": [{ "sku": "123", "quantity": 10 }] }

    const products = Array.isArray(body) ? body : body.data || body.produtos || [body];

    const results = [];

    for (const item of products) {
      // Tenta encontrar o produto por código de referência (SKU)
      const reference = item.sku || item.codigo || item.reference || item.product_id;
      const quantity = parseInt(item.estoque || item.quantity || item.stock || item.qtd || 0);

      if (reference) {
        // Primeiro, tenta encontrar o produto pela referência
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id, reference')
          .eq('reference', String(reference))
          .maybeSingle();

        if (existingProduct) {
          // Atualiza o estoque
          const { error } = await supabase
            .from('products')
            .update({
              stock_quantity: quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id);

          results.push({
            reference,
            status: error ? 'error' : 'updated',
            message: error ? error.message : 'Stock updated successfully'
          });
        } else {
          // Produto não encontrado - cria um registro de produto básico se tiver dados
          if (item.name || item.nome) {
            const { data: newProduct, error: createError } = await supabase
              .from('products')
              .insert({
                id: crypto.randomUUID(),
                name: item.name || item.nome,
                reference: reference,
                slug: (item.name || item.nome).toLowerCase()
                  .normalize('NFD')
                  .replace(/[̀-ͯ]/g, '')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .trim()
                  .replace(/\s+/g, '-'),
                stock_quantity: quantity,
                availability: quantity > 0 ? 'in-stock' : 'out-of-stock',
                is_active: true,
                created_at: new Date().toISOString()
              })
              .select()
              .single();

            results.push({
              reference,
              status: createError ? 'error' : 'created',
              message: createError ? createError.message : 'Product created with stock'
            });
          } else {
            results.push({
              reference,
              status: 'not_found',
              message: 'Product not found and no name provided'
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Erro ao processar callback de estoque:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process stock callback' },
      { status: 500 }
    );
  }
}

// Retorna informações sobre o endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: 'magis5/stock',
    method: 'POST',
    description: 'Callback para sincronização de estoque do Magis5/ERP',
    expectedFormat: {
      json: {
        example: [
          { "sku": "PROD-001", "quantity": 25 },
          { "sku": "PROD-002", "quantity": 10 }
        ]
      }
    }
  });
}
