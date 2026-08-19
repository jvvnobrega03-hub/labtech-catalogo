import { NextResponse } from 'next/server';

/**
 * Endpoint principal da API Magis5
 * Redireciona para a documentação dos endpoints disponíveis
 */
export async function GET() {
  return NextResponse.json({
    name: 'API Magis5 Integration',
    version: '1.0.0',
    description: 'Endpoints para integração com Magis5/ERP',
    endpoints: {
      products: {
        path: '/api/magis5/products',
        method: 'POST',
        description: 'Sincronizar produtos do ERP para o catálogo'
      },
      stock: {
        path: '/api/magis5/stock',
        method: 'POST',
        description: 'Receber atualizações de estoque'
      },
      orders: {
        path: '/api/magis5/orders',
        method: 'POST',
        description: 'Receber atualizações de pedidos'
      },
      invoices: {
        path: '/api/magis5/invoices',
        method: 'POST',
        description: 'Receber atualizações de notas fiscais'
      }
    },
    // URLs de callback para configurar no ERP/Magis5
    callbacks: {
      stock: 'https://seudominio.com/api/magis5/stock',
      orders: 'https://seudominio.com/api/magis5/orders',
      invoices: 'https://seudominio.com/api/magis5/invoices'
    }
  });
}
