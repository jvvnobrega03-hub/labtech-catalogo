import { NextResponse } from 'next/server';
import { detectDocumentType, onlyNumbers, validateDocument, validateEmail, validatePasswordSimple, validatePhone } from '@/lib/validation';
import { createSupabaseAdminClient, createSupabaseSignupClient } from '@/lib/supabase/server';
import { sendNewCustomerNotification } from '@/lib/email';
import { createHash, randomBytes } from 'crypto';

interface RegistrationPayload {
  representative_name?: unknown;
  position?: unknown;
  document?: unknown;
  company_name?: unknown;
  postal_code?: unknown;
  street?: unknown;
  number?: unknown;
  neighborhood?: unknown;
  city?: unknown;
  state?: unknown;
  complement?: unknown;
  reference_point?: unknown;
  phone?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  terms?: unknown;
}

const requiredTextFields = [
  'representative_name',
  'position',
  'company_name',
  'street',
  'number',
  'neighborhood',
  'city',
] as const;

function normalizedText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (normalized.length > maxLength) return undefined;
  return normalized || null;
}

function validationError(error: string, fields?: Record<string, string>) {
  return NextResponse.json({ success: false, error, fields }, { status: 400 });
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;
  const admin = createSupabaseAdminClient();

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 20_000) return validationError('Dados de cadastro inválidos.');

    const body = await request.json() as RegistrationPayload;
    const fields: Record<string, string> = {};
    const values: Record<string, string> = {};

    for (const field of requiredTextFields) {
      const value = normalizedText(body[field], field === 'position' ? 100 : 255);
      if (!value) fields[field] = 'Campo obrigatório ou inválido.';
      else values[field] = value;
    }

    const document = typeof body.document === 'string' ? onlyNumbers(body.document) : '';
    const documentType = detectDocumentType(document);
    if (!documentType || !validateDocument(document)) fields.document = 'CPF ou CNPJ inválido.';

    const postalCode = typeof body.postal_code === 'string' ? onlyNumbers(body.postal_code) : '';
    if (postalCode.length !== 8) fields.postal_code = 'CEP inválido.';

    const phone = typeof body.phone === 'string' ? onlyNumbers(body.phone) : '';
    if (!validatePhone(phone)) fields.phone = 'Telefone inválido.';

    const state = normalizedText(body.state, 2)?.toUpperCase() || '';
    if (!/^[A-Z]{2}$/.test(state)) fields.state = 'UF inválida.';

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email.length > 255 || !validateEmail(email)) fields.email = 'E-mail inválido.';

    const password = typeof body.password === 'string' ? body.password : '';
    const passwordError = validatePasswordSimple(password);
    if (passwordError || password.length > 128) fields.password = passwordError || 'Senha inválida.';
    if (body.confirmPassword !== password) fields.confirmPassword = 'As senhas não coincidem.';
    if (body.terms !== true) fields.terms = 'Você deve aceitar os termos de uso.';

    const complement = optionalText(body.complement, 255);
    const referencePoint = optionalText(body.reference_point, 255);
    if (complement === undefined) fields.complement = 'Complemento inválido.';
    if (referencePoint === undefined) fields.reference_point = 'Ponto de referência inválido.';

    if (Object.keys(fields).length) return validationError('Revise os dados informados.', fields);

    const [documentCheck, emailCheck] = await Promise.all([
      admin.from('customer_profiles').select('id').eq('document', document).maybeSingle(),
      admin.from('customer_profiles').select('id').ilike('email', email).maybeSingle(),
    ]);

    if (documentCheck.error || emailCheck.error) throw new Error('duplicate check failed');
    if (documentCheck.data) fields.document = `Este ${documentType} já possui cadastro.`;
    if (emailCheck.data) fields.email = 'Este e-mail já possui cadastro.';
    if (Object.keys(fields).length) return validationError('CPF/CNPJ ou e-mail já cadastrado.', fields);

    const signup = createSupabaseSignupClient();
    const { data: authData, error: authError } = await signup.auth.signUp({ email, password });

    if (authError || !authData.user) {
      const duplicate = authError?.message.toLowerCase().includes('already') || authError?.message.toLowerCase().includes('registered');
      return NextResponse.json(
        { success: false, error: duplicate ? 'Este e-mail já possui cadastro.' : 'Não foi possível criar a conta. Verifique os dados e tente novamente.' },
        { status: duplicate ? 409 : 400 },
      );
    }

    createdUserId = authData.user.id;

    const { data: customer, error: profileError } = await admin
      .from('customer_profiles')
      .insert({
        auth_user_id: createdUserId,
        representative_name: values.representative_name,
        position: values.position,
        document,
        document_type: documentType,
        company_name: values.company_name,
        postal_code: postalCode,
        street: values.street,
        number: values.number,
        neighborhood: values.neighborhood,
        city: values.city,
        state,
        complement,
        reference_point: referencePoint,
        phone,
        email,
        status: 'PENDING',
      })
      .select('id, representative_name, position, document, document_type, company_name, phone, email, postal_code, street, number, neighborhood, city, state, complement, reference_point')
      .single();

    if (profileError || !customer) {
      await admin.auth.admin.deleteUser(createdUserId);
      createdUserId = null;

      if (profileError?.code === '23505') {
        return NextResponse.json({ success: false, error: 'CPF/CNPJ ou e-mail já cadastrado.' }, { status: 409 });
      }
      throw new Error('profile creation failed');
    }

    const approvalToken = randomBytes(32).toString('hex');
    const rejectToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error: tokenError } = await admin.from('approval_tokens').insert([
      { customer_id: customer.id, token_hash: createHash('sha256').update(approvalToken).digest('hex'), action: 'APPROVE', expires_at: expiresAt },
      { customer_id: customer.id, token_hash: createHash('sha256').update(rejectToken).digest('hex'), action: 'REJECT', expires_at: expiresAt },
    ]);

    if (!tokenError) {
      const emailResult = await sendNewCustomerNotification(customer, approvalToken, rejectToken);
      await admin.from('customer_profiles').update({
        approval_notification_sent_at: emailResult.success ? new Date().toISOString() : null,
        approval_notification_error: emailResult.error || null,
        approval_notification_attempts: 1,
      }).eq('id', customer.id);
    }

    return NextResponse.json({ success: true, status: 'PENDING' }, { status: 201 });
  } catch (error) {
    if (createdUserId) await admin.auth.admin.deleteUser(createdUserId);
    console.error('Customer registration failed:', error);
    return NextResponse.json({ success: false, error: 'Não foi possível concluir o cadastro. Tente novamente.' }, { status: 500 });
  }
}
