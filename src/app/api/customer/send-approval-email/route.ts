import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCustomerApprovalEmail } from '@/lib/email';

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

    // Verificar se o cliente está aprovado
    if (customer.status !== 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Cliente não está aprovado' }, { status: 400 });
    }

    // Enviar e-mail de aprovação
    const emailResult = await sendCustomerApprovalEmail(customer);

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success
        ? 'E-mail enviado com sucesso'
        : 'Erro ao enviar e-mail',
      error: emailResult.error,
    });
  } catch (error: any) {
    console.error('Erro ao enviar e-mail:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
