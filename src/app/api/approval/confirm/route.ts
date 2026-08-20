import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCustomerApprovalEmail, sendCustomerRejectionEmail } from '@/lib/email';

//crypto import for Node.js
const crypto = require('crypto');

async function hashToken(token: string): Promise<string> {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, action, rejectReason } = await request.json();

    if (!token || !action) {
      return NextResponse.json({ success: false, error: 'Parâmetros inválidos' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
    }

    // Hash do token
    const tokenHash = await hashToken(token);

    // Buscar o token no banco
    const { data: tokenData, error: tokenError } = await supabase
      .from('approval_tokens')
      .select(`
        id,
        customer_id,
        action:action,
        used_at,
        expires_at
      `)
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ success: false, error: 'Token não encontrado' }, { status: 404 });
    }

    // Verificar se o token já foi usado
    if (tokenData.used_at) {
      return NextResponse.json({ success: false, error: 'Token já utilizado' }, { status: 400 });
    }

    // Verificar se o token expirou
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Token expirado' }, { status: 400 });
    }

    // Verificar se a ação do token corresponde
    const expectedAction = action === 'approve' ? 'APPROVE' : 'REJECT';
    if (tokenData.action !== expectedAction) {
      return NextResponse.json({ success: false, error: 'Ação do token não corresponde' }, { status: 400 });
    }

    // Buscar dados completos do cliente
    const { data: customer, error: customerError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', tokenData.customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verificar se já está aprovado (evitar duplicação de e-mail)
    const wasAlreadyApproved = customer.status === 'APPROVED';

    if (action === 'approve') {
      // Aprovar cliente
      const { error: updateError } = await supabase
        .from('customer_profiles')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approval_method: 'EMAIL',
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id);

      if (updateError) {
        return NextResponse.json({ success: false, error: 'Erro ao aprovar cliente' }, { status: 500 });
      }

      // Enviar e-mail de aprovação para o cliente (apenas se não estava aprovado antes)
      if (!wasAlreadyApproved) {
        try {
          await sendCustomerApprovalEmail(customer);
        } catch (emailError) {
          console.error('Erro ao enviar e-mail de aprovação:', emailError);
          // Não bloqueia o processo se o e-mail falhar
        }
      }
    } else {
      // Rejeitar cliente
      const { error: updateError } = await supabase
        .from('customer_profiles')
        .update({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectReason || null,
          approval_method: 'EMAIL',
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id);

      if (updateError) {
        return NextResponse.json({ success: false, error: 'Erro ao rechazar cliente' }, { status: 500 });
      }

      // Enviar e-mail de rejeição para o cliente
      try {
        await sendCustomerRejectionEmail(customer, rejectReason);
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de rejeição:', emailError);
        // Não bloqueia o processo se o e-mail falhar
      }
    }

    // Marcar token como usado
    await supabase
      .from('approval_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Cliente aprovado com sucesso' : 'Cliente rejeitado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao processar confirmação:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
