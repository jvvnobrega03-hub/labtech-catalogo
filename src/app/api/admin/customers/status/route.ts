import { NextResponse } from 'next/server';
import { sendCustomerApprovalEmail } from '@/lib/email';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

const actions = ['APPROVE', 'REJECT', 'SUSPEND', 'REACTIVATE'] as const;
type CustomerAction = typeof actions[number];

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user || user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 403 });
    }

    const body = await request.json() as { customerId?: unknown; action?: unknown; reason?: unknown };
    if (typeof body.customerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.customerId)) {
      return NextResponse.json({ success: false, error: 'Cliente inválido.' }, { status: 400 });
    }
    if (typeof body.action !== 'string' || !actions.includes(body.action as CustomerAction)) {
      return NextResponse.json({ success: false, error: 'Ação inválida.' }, { status: 400 });
    }

    const action = body.action as CustomerAction;
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 1000) : '';
    if ((action === 'REJECT' || action === 'SUSPEND') && !reason) {
      return NextResponse.json({ success: false, error: 'Informe o motivo.' }, { status: 400 });
    }

    const { data: customer, error: customerError } = await admin
      .from('customer_profiles')
      .select('*')
      .eq('id', body.customerId)
      .single();
    if (customerError || !customer) return NextResponse.json({ success: false, error: 'Cliente não encontrado.' }, { status: 404 });

    const now = new Date().toISOString();
    let expectedStatus: string;
    let update: Record<string, string | null>;

    if (action === 'APPROVE') {
      expectedStatus = 'PENDING';
      update = { status: 'APPROVED', approved_at: now, approved_by: user.id, approval_method: 'ADMIN', rejected_at: null, rejected_by: null, rejection_reason: null };
    } else if (action === 'REJECT') {
      expectedStatus = 'PENDING';
      update = { status: 'REJECTED', rejected_at: now, rejected_by: user.id, rejection_reason: reason };
    } else if (action === 'SUSPEND') {
      expectedStatus = 'APPROVED';
      update = { status: 'SUSPENDED', suspended_at: now, suspended_by: user.id, suspension_reason: reason };
    } else {
      expectedStatus = 'SUSPENDED';
      update = { status: 'APPROVED', suspended_at: null, suspended_by: null, suspension_reason: null };
    }

    if (customer.status !== expectedStatus) {
      return NextResponse.json({ success: false, error: 'Esta ação não é permitida para o status atual.' }, { status: 409 });
    }

    const { data: updated, error: updateError } = await admin
      .from('customer_profiles')
      .update(update)
      .eq('id', customer.id)
      .eq('status', expectedStatus)
      .select('id')
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ success: false, error: 'O cadastro foi alterado por outra operação.' }, { status: 409 });

    await admin.from('approval_tokens').update({ used_at: now }).eq('customer_id', customer.id).is('used_at', null);

    if (action === 'APPROVE') {
      const emailResult = await sendCustomerApprovalEmail({ ...customer, ...update });
      return NextResponse.json({ success: true, emailSent: emailResult.success });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer status update failed:', error);
    return NextResponse.json({ success: false, error: 'Não foi possível atualizar o cadastro.' }, { status: 500 });
  }
}
