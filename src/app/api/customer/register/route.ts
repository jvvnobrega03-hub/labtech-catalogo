import { NextResponse } from 'next/server';
import { detectDocumentType, onlyNumbers, validateDocument, validateEmail, validatePasswordSimple, validatePhone } from '@/lib/validation';
import { createSupabaseAdminClient, createSupabaseSignupClient } from '@/lib/supabase/server';
import { sendNewCustomerNotification } from '@/lib/email';
import { createHash, randomBytes } from 'crypto';

export const runtime = 'nodejs';

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

function errorResponse(
  status: number,
  error: string,
  message: string,
  fields?: Record<string, string>,
) {
  return NextResponse.json({ success: false, error, message, fields }, { status });
}

function validationError(message: string, fields?: Record<string, string>) {
  return errorResponse(400, 'VALIDATION_ERROR', message, fields);
}

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

async function rollbackRegistration(
  admin: AdminClient,
  userId: string | null,
  customerId: string | null,
) {
  if (customerId) {
    const { error } = await admin.from('customer_profiles').delete().eq('id', customerId);
    if (error) {
      console.error('[CUSTOMER_REGISTER][PROFILE_ROLLBACK]', { code: error.code, message: error.message });
    }
  }

  if (userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[CUSTOMER_REGISTER][AUTH_ROLLBACK]', { message: error.message });
    }
  }
}

function isSupabaseConfigurationError(error: unknown): error is Error {
  return error instanceof Error && error.message.includes('Supabase') && error.message.includes('configuration');
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;
  let createdCustomerId: string | null = null;
  let admin: AdminClient | null = null;

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 20_000) return validationError('Dados de cadastro inválidos.');

    let body: RegistrationPayload;
    try {
      body = await request.json() as RegistrationPayload;
    } catch {
      return validationError('Dados de cadastro inválidos.');
    }

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

    admin = createSupabaseAdminClient();

    const [documentCheck, emailCheck] = await Promise.all([
      admin.from('customer_profiles').select('id').eq('document', document).maybeSingle(),
      admin.from('customer_profiles').select('id').ilike('email', email).maybeSingle(),
    ]);

    if (documentCheck.error || emailCheck.error) {
      console.error('[CUSTOMER_REGISTER][DUPLICATE_CHECK]', {
        documentCode: documentCheck.error?.code,
        emailCode: emailCheck.error?.code,
      });
      throw new Error('Customer duplicate check failed');
    }
    if (documentCheck.data) fields.document = `Este ${documentType} já possui cadastro.`;
    if (emailCheck.data) fields.email = 'Este e-mail já possui cadastro.';
    if (Object.keys(fields).length) {
      return errorResponse(409, 'CUSTOMER_ALREADY_EXISTS', 'Já existe uma solicitação associada a estes dados.', fields);
    }

    const signup = createSupabaseSignupClient();
    const { data: authData, error: authError } = await signup.auth.signUp({ email, password });
    const existingAuthUser = authData.user?.identities?.length === 0;

    if (authError || !authData.user || existingAuthUser) {
      const duplicate = authError?.message.toLowerCase().includes('already') || authError?.message.toLowerCase().includes('registered');
      if (duplicate || existingAuthUser) {
        return errorResponse(409, 'CUSTOMER_ALREADY_EXISTS', 'Já existe uma solicitação associada a este e-mail.', {
          email: 'Este e-mail já possui cadastro.',
        });
      }
      return errorResponse(400, 'ACCOUNT_CREATION_FAILED', 'Não foi possível criar a conta. Verifique os dados e tente novamente.');
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
      await rollbackRegistration(admin, createdUserId, null);
      createdUserId = null;

      if (profileError?.code === '23505') {
        return errorResponse(409, 'CUSTOMER_ALREADY_EXISTS', 'Já existe uma solicitação associada a estes dados.');
      }
      console.error('[CUSTOMER_REGISTER][PROFILE]', { code: profileError?.code, message: profileError?.message });
      throw new Error('Customer profile creation failed');
    }

    createdCustomerId = customer.id;

    const approvalToken = randomBytes(32).toString('hex');
    const rejectToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error: tokenError } = await admin.from('approval_tokens').insert([
      { customer_id: customer.id, token_hash: createHash('sha256').update(approvalToken).digest('hex'), action: 'APPROVE', expires_at: expiresAt },
      { customer_id: customer.id, token_hash: createHash('sha256').update(rejectToken).digest('hex'), action: 'REJECT', expires_at: expiresAt },
    ]);

    if (tokenError) {
      console.error('[CUSTOMER_REGISTER][APPROVAL_TOKENS]', { code: tokenError.code, message: tokenError.message });
      throw new Error('Approval token creation failed');
    }

    const emailResult = await sendNewCustomerNotification(customer, approvalToken, rejectToken);
    if (!emailResult.success) {
      console.error('[CUSTOMER_REGISTER][NOTIFICATION]', { message: emailResult.error || 'Notification delivery failed' });
    }

    const { error: notificationUpdateError } = await admin.from('customer_profiles').update({
      approval_notification_sent_at: emailResult.success ? new Date().toISOString() : null,
      approval_notification_error: emailResult.error || null,
      approval_notification_attempts: 1,
    }).eq('id', customer.id);
    if (notificationUpdateError) {
      console.error('[CUSTOMER_REGISTER][NOTIFICATION_AUDIT]', {
        code: notificationUpdateError.code,
        message: notificationUpdateError.message,
      });
    }

    return NextResponse.json({
      success: true,
      data: { status: 'PENDING' },
      message: 'Solicitação de cadastro enviada com sucesso.',
    }, { status: 201 });
  } catch (error) {
    if (admin && (createdUserId || createdCustomerId)) {
      await rollbackRegistration(admin, createdUserId, createdCustomerId);
    }

    if (isSupabaseConfigurationError(error)) {
      console.error('[CUSTOMER_REGISTER][CONFIG]', { message: error.message });
      return errorResponse(503, 'REGISTRATION_UNAVAILABLE', 'O cadastro está temporariamente indisponível. Tente novamente mais tarde.');
    }

    console.error('[CUSTOMER_REGISTER][UNEXPECTED]', {
      message: error instanceof Error ? error.message : 'Unknown registration error',
    });
    return errorResponse(500, 'REGISTRATION_FAILED', 'Não foi possível concluir o cadastro. Tente novamente.');
  }
}
