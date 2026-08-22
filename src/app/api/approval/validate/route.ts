import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function unavailableResponse(error: { code?: string; message?: string }) {
  const details = `${error.code || ''} ${error.message || ''}`.toLowerCase();
  const errorCode = details.includes('supabase server configuration') || details.includes('configuration is incomplete')
    ? 'SUPABASE_SERVER_CONFIGURATION_MISSING'
    : details.includes('invalid api key') || details.includes('401')
    ? 'SUPABASE_SERVER_KEY_INVALID'
    : details.includes('fetch failed') || details.includes('enotfound')
      ? 'SUPABASE_CONNECTION_FAILED'
      : details.includes('42p01') || details.includes('pgrst205')
        ? 'SUPABASE_SCHEMA_ERROR'
        : 'SUPABASE_OPERATION_FAILED';

  console.error('[APPROVAL_VALIDATE][DATABASE]', { code: error.code, message: error.message });
  return NextResponse.json({
    valid: false,
    error: errorCode,
    message: 'Não foi possível consultar o serviço de aprovações.',
  }, { status: 503 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: unknown };
    if (typeof body.token !== 'string' || !/^[0-9a-f]{64}$/i.test(body.token)) {
      return NextResponse.json({ valid: false, error: 'Token inválido.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const tokenHash = createHash('sha256').update(body.token).digest('hex');
    const { data: tokenData, error: tokenError } = await supabase
      .from('approval_tokens')
      .select('id, customer_id, action, used_at, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (tokenError) return unavailableResponse(tokenError);
    if (!tokenData) {
      return NextResponse.json({ valid: false, error: 'Token não encontrado' }, { status: 404 });
    }
    if (tokenData.used_at) {
      return NextResponse.json({ valid: false, error: 'Token já utilizado' }, { status: 400 });
    }
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token expirado' }, { status: 400 });
    }

    const { data: customer, error: customerError } = await supabase
      .from('customer_profiles')
      .select('id, representative_name, company_name, document, document_type, email, status')
      .eq('id', tokenData.customer_id)
      .maybeSingle();

    if (customerError) return unavailableResponse(customerError);
    if (!customer) {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('[APPROVAL_VALIDATE][UNEXPECTED]', { message });
    return unavailableResponse({ message });
  }
}
