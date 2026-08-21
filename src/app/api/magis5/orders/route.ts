import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();

// Webhook secret para autenticar chamadas do Magis5
// Em produção, usar variável de ambiente MAGIS5_WEBHOOK_SECRET
const WEBHOOK_SECRET = process.env.MAGIS5_WEBHOOK_SECRET || 'dev-secret-change-in-production';

/**
 * Verifica se a requisição é autorizada
 */
function isAuthorized(request: Request): boolean {
  // 1. Primeiro verifica header de autorização
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${WEBHOOK_SECRET}`) {
    return true;
  }

  // 2. Verifica header x-webhook-key
  const webhookKey = request.headers.get('x-webhook-key');
  if (webhookKey === WEBHOOK_SECRET) {
    return true;
  }

  return false;
}

/**
 * Callback de pedidos do Magis5
 * Recebe notificações de alteração de situação de pedidos
 */
export async function POST(request: Request) {
  try {
    // Verifica autorização - apenas sistemas autorizados podem chamar
    if (!isAuthorized(request)) {
      console.warn('Unauthorized attempt to access magis5/orders API');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Formatos possíveis:
    // { "pedido": { "numero": "123", "situacao": "Faturado" } }
    // { "data": [{ "order_id": "123", "status": "paid" }] }

    const orders = Array.isArray(body) ? body : body.data || body.pedidos || body.pedido ? [body.pedido] : [body];

    const results = [];

    for (const order of orders) {
      const orderId = order.numero || order.id || order.order_id || order.orderNumber;
      const status = order.situacao || order.status || order.situation || 'unknown';
      const customerName = order.cliente || order.customer || order.customerName;
      const totalValue = order.valor_total || order.total || order.totalValue;
      const items = order.itens || order.items || [];

      // Mapeia situação do ERP para status interno
      const statusMap: Record<string, string> = {
        'Aberto': 'pending',
        'Pago': 'paid',
        'Faturado': 'shipped',
        'Entregue': 'delivered',
        'Cancelado': 'cancelled',
        'pending': 'pending',
        'paid': 'paid',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
      };

      const mappedStatus = statusMap[status] || 'pending';

      // Salva ou atualiza o pedido
      const orderData = {
        magis5_order_id: orderId,
        status: mappedStatus,
        original_status: status,
        customer_name: customerName,
        total_value: totalValue,
        items_count: items.length,
        raw_data: order,
        updated_at: new Date().toISOString()
      };

      // Verifica se o pedido já existe
      const { data: existingOrder } = await supabase
        .from('magis5_orders')
        .select('id')
        .eq('magis5_order_id', String(orderId))
        .maybeSingle();

      let result;

      if (existingOrder) {
        // Atualiza pedido existente
        const { data, error } = await supabase
          .from('magis5_orders')
          .update(orderData)
          .eq('id', existingOrder.id)
          .select()
          .single();

        result = { orderId, status: error ? 'error' : 'updated', data, error: error?.message };
      } else {
        // Cria novo pedido
        const { data, error } = await supabase
          .from('magis5_orders')
          .insert({
            id: crypto.randomUUID(),
            ...orderData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        result = { orderId, status: error ? 'error' : 'created', data, error: error?.message };
      }

      results.push(result);

      // Se o pedido foi pago/faturado, pode diminuir estoque automaticamente
      if (mappedStatus === 'paid' || mappedStatus === 'shipped') {
        for (const item of items) {
          const sku = item.codigo || item.sku || item.product_id;
          const qty = parseInt(item.quantidade || item.quantity || 1);

          if (sku) {
            try {
              // Tenta usar a função RPC
              await supabase.rpc('decrease_product_stock', {
                p_reference: String(sku),
                p_quantity: qty
              });
            } catch {
              // Se a função RPC não existir, faz manualmente
              const { data: product } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('reference', String(sku))
                .maybeSingle();

              if (product) {
                await supabase
                  .from('products')
                  .update({ stock_quantity: Math.max(0, (product.stock_quantity || 0) - qty) })
                  .eq('reference', String(sku));
              }
            }
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
    console.error('Erro ao processar callback de pedidos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process orders callback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'magis5/orders',
    method: 'POST',
    description: 'Callback para sincronização de pedidos do Magis5/ERP',
    auth: 'Requer header Authorization: Bearer <MAGIS5_WEBHOOK_SECRET> ou x-webhook-key',
    expectedFormat: {
      json: {
        example: {
          "numero": "12345",
          "situacao": "Faturado",
          "cliente": "João Silva",
          "valor_total": 150.00,
          "itens": [
            { "codigo": "PROD-001", "quantidade": 2 }
          ]
        }
      }
    }
  });
}
