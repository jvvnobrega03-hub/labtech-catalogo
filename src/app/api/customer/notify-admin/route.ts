import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNewCustomerNotification, sendCustomerApprovalEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'ID do cliente não fornecido' }, { status: 400 });
    }

    // Buscar dados do cliente
    const { data: customer, error: customerError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verificar se já foi enviado (evitar duplicação)
    if (customer.approval_notification_sent_at) {
      return NextResponse.json({ success: true, message: 'Notificação já enviada anteriormente' });
    }

    // Gerar tokens de aprovação e rejeição
    const crypto = require('crypto');

    const generateToken = () => crypto.randomBytes(32).toString('hex');
    const approvalToken = generateToken();
    const rejectToken = generateToken();

    const approvalTokenHash = crypto.createHash('sha256').update(approvalToken).digest('hex');
    const rejectTokenHash = crypto.createHash('sha256').update(rejectToken).digest('hex');

    // Inserir tokens no banco
    const { error: tokenError } = await supabase
      .from('approval_tokens')
      .insert([
        {
          customer_id: customer.id,
          token_hash: approvalTokenHash,
          action: 'APPROVE',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        },
        {
          customer_id: customer.id,
          token_hash: rejectTokenHash,
          action: 'REJECT',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);

    if (tokenError) {
      console.error('Erro ao criar tokens:', tokenError);
      return NextResponse.json({ success: false, error: 'Erro ao criar tokens de aprovação' }, { status: 500 });
    }

    // Enviar e-mail para o admin
    const emailResult = await sendNewCustomerNotification(customer, approvalToken);

    // Atualizar status de notificação no banco
    if (emailResult.success) {
      await supabase
        .from('customer_profiles')
        .update({
          approval_notification_sent_at: new Date().toISOString(),
          approval_notification_attempts: (customer.approval_notification_attempts || 0) + 1,
        })
        .eq('id', customer.id);
    } else {
      // Registrar erro mas não falhar
      await supabase
        .from('customer_profiles')
        .update({
          approval_notification_error: emailResult.error,
          approval_notification_attempts: (customer.approval_notification_attempts || 0) + 1,
        })
        .eq('id', customer.id);
    }

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success
        ? 'Notificação enviada com sucesso'
        : 'Erro ao enviar notificação',
      error: emailResult.error,
    });
  } catch (error: any) {
    console.error('Erro ao processar notificação:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Handler para reenviar notificação
export async function PUT(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'ID do cliente não fornecido' }, { status: 400 });
    }

    // Buscar dados do cliente
    const { data: customer, error: customerError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verificar se o cliente ainda está pendente
    if (customer.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Cliente não está pendente' }, { status: 400 });
    }

    // Verificar se já existe token
    const { data: existingTokens } = await supabase
      .from('approval_tokens')
      .select('id')
      .eq('customer_id', customerId)
      .eq('used_at', null)
      .gt('expires_at', new Date().toISOString());

    // Gerar novos tokens se necessário
    const crypto = require('crypto');
    const generateToken = () => crypto.randomBytes(32).toString('hex');
    let approvalToken = '';

    if (!existingTokens || existingTokens.length === 0) {
      approvalToken = generateToken();
      const approvalTokenHash = crypto.createHash('sha256').update(approvalToken).digest('hex');

      await supabase
        .from('approval_tokens')
        .insert({
          customer_id: customer.id,
          token_hash: approvalTokenHash,
          action: 'APPROVE',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
    } else {
      // Buscar o token existente (precisaríamos recuperar de alguma forma)
      // Por segurança, vamos criar um novo token
      approvalToken = generateToken();
      const approvalTokenHash = crypto.createHash('sha256').update(approvalToken).digest('hex');

      await supabase
        .from('approval_tokens')
        .insert({
          customer_id: customer.id,
          token_hash: approvalTokenHash,
          action: 'APPROVE',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    // Enviar e-mail para o admin
    const emailResult = await sendNewCustomerNotification(customer, approvalToken);

    // Atualizar status
    await supabase
      .from('customer_profiles')
      .update({
        approval_notification_sent_at: emailResult.success ? new Date().toISOString() : null,
        approval_notification_error: emailResult.error || null,
        approval_notification_attempts: (customer.approval_notification_attempts || 0) + 1,
      })
      .eq('id', customer.id);

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success
        ? 'Notificação reenviada com sucesso'
        : 'Erro ao enviar notificação',
      error: emailResult.error,
    });
  } catch (error: any) {
    console.error('Erro ao reenviar notificação:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
