import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { sendCustomerApprovalEmail, sendCustomerRejectionEmail, type CustomerData } from '@/lib/email';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { token?: unknown; action?: unknown; rejectReason?: unknown };
    if (typeof body.token !== 'string' || !/^[0-9a-f]{64}$/i.test(body.token)) {
      return NextResponse.json({ success: false, error: 'Token inválido.' }, { status: 400 });
    }
    if (body.action !== 'approve' && body.action !== 'reject') {
      return NextResponse.json({ success: false, error: 'Ação inválida.' }, { status: 400 });
    }

    const rejectReason = typeof body.rejectReason === 'string' ? body.rejectReason.trim().slice(0, 1000) : null;
    const action = body.action === 'approve' ? 'APPROVE' : 'REJECT';
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc('consume_customer_approval_token', {
      p_token_hash: createHash('sha256').update(body.token).digest('hex'),
      p_action: action,
      p_reject_reason: rejectReason,
    }).single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Token inválido, expirado ou já utilizado.' }, { status: 400 });
    }

    const customer = data as CustomerData;
    if (action === 'APPROVE') await sendCustomerApprovalEmail(customer);
    else await sendCustomerRejectionEmail(customer, rejectReason || undefined);

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'Cliente aprovado com sucesso' : 'Cliente rejeitado com sucesso',
    });
  } catch (error) {
    console.error('Approval confirmation failed:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
