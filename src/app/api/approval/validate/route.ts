import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token não fornecido' }, { status: 400 });
    }

    // Fazer hash do token para comparação
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar o token no banco
    const { data: tokenData, error: tokenError } = await supabase
      .from('approval_tokens')
      .select(`
        id,
        customer_id,
        action,
        used_at,
        expires_at
      `)
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ valid: false, error: 'Token não encontrado' }, { status: 404 });
    }

    // Verificar se o token já foi usado
    if (tokenData.used_at) {
      return NextResponse.json({ valid: false, error: 'Token já utilizado' }, { status: 400 });
    }

    // Verificar se o token expirou
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token expirado' }, { status: 400 });
    }

    // Buscar dados do cliente
    const { data: customer, error: customerError } = await supabase
      .from('customer_profiles')
      .select(`
        id,
        representative_name,
        company_name,
        document,
        document_type,
        email,
        status
      `)
      .eq('id', tokenData.customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ valid: false, error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      customer: {
        id: customer.id,
        representative_name: customer.representative_name,
        company_name: customer.company_name,
        document: customer.document,
        document_type: customer.document_type,
        email: customer.email,
        status: customer.status,
      },
      action: tokenData.action,
    });
  } catch (error: any) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json({ valid: false, error: 'Erro interno' }, { status: 500 });
  }
}
