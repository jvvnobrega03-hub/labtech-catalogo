import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { document, email } = body;

    const errors: Record<string, string> = {};

    // Verificar CPF/CNPJ duplicado
    if (document) {
      const { data: existingByDoc } = await supabase
        .from('customer_profiles')
        .select('id, email, document')
        .eq('document', document)
        .maybeSingle();

      if (existingByDoc) {
        const docType = document.length === 11 ? 'CPF' : 'CNPJ';
        errors.document = `Este ${docType} já possui cadastro.`;
      }
    }

    // Verificar e-mail duplicado
    if (email) {
      const { data: existingByEmail } = await supabase
        .from('customer_profiles')
        .select('id, email')
        .ilike('email', email)
        .maybeSingle();

      if (existingByEmail) {
        errors.email = 'Este e-mail já possui cadastro.';
      }
    }

    // Verificar também no auth do Supabase
    if (email) {
      const { data: authUser } = await supabase.auth.admin.listUsers();
      const existingAuth = authUser?.users.find(
        u => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (existingAuth) {
        errors.email = 'Este e-mail já está cadastrado no sistema.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ valid: false, errors }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Erro ao verificar duplicatas:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar dados' },
      { status: 500 }
    );
  }
}
