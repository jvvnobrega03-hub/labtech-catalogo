import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();

// Webhook secret para autenticar chamadas do Magis5
const WEBHOOK_SECRET = process.env.MAGIS5_WEBHOOK_SECRET || 'dev-secret-change-in-production';

/**
 * Verifica se a requisição é autorizada
 */
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${WEBHOOK_SECRET}`) {
    return true;
  }

  const webhookKey = request.headers.get('x-webhook-key');
  if (webhookKey === WEBHOOK_SECRET) {
    return true;
  }

  return false;
}

/**
 * Callback de notas fiscais do Magis5
 * Recebe notificações de alteração de situação de notas fiscais
 */
export async function POST(request: Request) {
  try {
    // Verifica autorização
    if (!isAuthorized(request)) {
      console.warn('Unauthorized attempt to access magis5/invoices API');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Formatos possíveis:
    // { "nota": { "numero": "123", "situacao": "Autorizada" } }
    // { "data": [{ "invoice_id": "123", "status": "authorized" }] }

    const invoices = Array.isArray(body) ? body : body.data || body.notas || body.nota ? [body.nota] : [body];

    const results = [];

    for (const invoice of invoices) {
      const invoiceNumber = invoice.numero || invoice.number || invoice.invoice_id || invoice.nfe_number;
      const status = invoice.situacao || invoice.status || invoice.situation || 'unknown';
      const key = invoice.chave || invoice.key || invoice.access_key;
      const date = invoice.data_emissao || invoice.date || invoice.issue_date;
      const value = invoice.valor_total || invoice.total || invoice.value;
      const orderId = invoice.pedido || invoice.order_id || invoice.orderNumber;

      // Mapeia situação da NFe para status interno
      const statusMap: Record<string, string> = {
        'Autorizada': 'authorized',
        'Cancelada': 'cancelled',
        'Denegada': 'denied',
        'Inutilizada': 'voided',
        'Pendência': 'pending',
        'authorized': 'authorized',
        'cancelled': 'cancelled',
        'denied': 'denied',
        'voided': 'voided',
        'pending': 'pending'
      };

      const mappedStatus = statusMap[status] || 'pending';

      // Salva ou atualiza a nota fiscal
      const invoiceData = {
        magis5_invoice_id: invoiceNumber,
        status: mappedStatus,
        original_status: status,
        invoice_key: key,
        issue_date: date,
        total_value: value,
        order_reference: orderId,
        raw_data: invoice,
        updated_at: new Date().toISOString()
      };

      // Verifica se a nota já existe
      const { data: existingInvoice } = await supabase
        .from('magis5_invoices')
        .select('id')
        .eq('magis5_invoice_id', String(invoiceNumber))
        .maybeSingle();

      let result;

      if (existingInvoice) {
        // Atualiza nota existente
        const { data, error } = await supabase
          .from('magis5_invoices')
          .update(invoiceData)
          .eq('id', existingInvoice.id)
          .select()
          .single();

        result = { invoiceNumber, status: error ? 'error' : 'updated', data, error: error?.message };
      } else {
        // Cria nova nota
        const { data, error } = await supabase
          .from('magis5_invoices')
          .insert({
            id: crypto.randomUUID(),
            ...invoiceData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        result = { invoiceNumber, status: error ? 'error' : 'created', data, error: error?.message };
      }

      results.push(result);

      // Se a nota foi cancelada, pode reverter o estoque
      if (mappedStatus === 'cancelled' && orderId) {
        // Busca os itens do pedido para reverter o estoque
        const { data: order } = await supabase
          .from('magis5_orders')
          .select('raw_data')
          .eq('magis5_order_id', String(orderId))
          .maybeSingle();

        if (order?.raw_data?.itens) {
          for (const item of order.raw_data.itens) {
            const sku = item.codigo || item.sku;
            const qty = parseInt(item.quantidade || item.quantity || 1);

            if (sku) {
              // Recupera o estoque
              await supabase
                .from('products')
                .select('stock_quantity')
                .eq('reference', String(sku))
                .maybeSingle()
                .then(({ data: product }) => {
                  if (product) {
                    supabase
                      .from('products')
                      .update({ stock_quantity: product.stock_quantity + qty })
                      .eq('reference', String(sku));
                  }
                });
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
    console.error('Erro ao processar callback de notas fiscais:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process invoices callback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'magis5/invoices',
    method: 'POST',
    description: 'Callback para sincronização de notas fiscais do Magis5/ERP',
    auth: 'Requer header Authorization: Bearer <MAGIS5_WEBHOOK_SECRET> ou x-webhook-key',
    expectedFormat: {
      json: {
        example: {
          "numero": "12345",
          "situacao": "Autorizada",
          "chave": "12345678901234567890123456789012345678901234",
          "data_emissao": "2024-01-15",
          "valor_total": 150.00,
          "pedido": "12345"
        }
      }
    }
  });
}
