import { Resend } from 'resend';

const ADMIN_EMAIL = process.env.ADMIN_APPROVAL_EMAIL || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'LABTECH <naoresponda@labtech.com.br>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface CustomerData {
  id: string;
  representative_name: string;
  position: string;
  document: string;
  document_type: string;
  company_name: string;
  phone: string;
  email: string;
  postal_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string | null;
  reference_point?: string | null;
}

interface ApprovalResult {
  success: boolean;
  error?: string;
}

// Enviar e-mail para o admin sobre novo cadastro pendente
export async function sendNewCustomerNotification(
  customer: CustomerData,
  approvalToken: string,
  rejectToken: string
): Promise<ApprovalResult> {
  if (!ADMIN_EMAIL) {
    console.error('ADMIN_APPROVAL_EMAIL não configurado');
    return { success: false, error: 'E-mail do responsável não configurado' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const approveUrl = `${APP_URL}/aprovacao?token=${approvalToken}&action=approve`;
  const rejectUrl = `${APP_URL}/aprovacao?token=${rejectToken}&action=reject`;

  const documentFormatted = customer.document_type === 'CNPJ'
    ? `${customer.document.slice(0, 2)}.${customer.document.slice(2, 5)}.${customer.document.slice(5, 8)}/${customer.document.slice(8, 12)}-${customer.document.slice(12)}`
    : `${customer.document.slice(0, 3)}.${customer.document.slice(3, 6)}.${customer.document.slice(6, 9)}-${customer.document.slice(9)}`;

  const phoneFormatted = `(${customer.phone.slice(0, 2)}) ${customer.phone.slice(2, 7)}-${customer.phone.slice(7)}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Cliente Aguardando Aprovação | LABTECH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4FBFD;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4FBFD; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #087A9F 0%, #0796C4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LABTECH</h1>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Catálogo Exclusivo</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h2 style="margin: 0; color: #102833; font-size: 22px; font-weight: 600;">Novo Cadastro Aguardando Aprovação</h2>
              <p style="margin: 10px 0 0 0; color: #102833; opacity: 0.7; font-size: 14px;">
                Um novo cliente solicitou acesso ao catálogo LABTECH.
              </p>
            </td>
          </tr>

          <!-- Data Section -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
                <!-- Dados do Representante -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Dados do Representante</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; width: 40%; color: #64748B; font-size: 13px;">Nome do Representante:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px; font-weight: 500;">${customer.representative_name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Cargo:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${customer.position}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">CPF/CNPJ:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;"><code style="background-color: #E2E8F0; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${documentFormatted}</code></td>
                </tr>

                <!-- Dados da Empresa -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Dados da Empresa</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Empresa / Razão Social:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px; font-weight: 500;">${customer.company_name}</td>
                </tr>

                <!-- Contato -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Contato</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Telefone:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${phoneFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">E-mail:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${customer.email}</td>
                </tr>

                <!-- Endereço -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0;">
                    <strong style="color: #087A9F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Endereço</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">CEP:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${customer.postal_code}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Endereço:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${customer.street}, ${customer.number}${customer.complement ? ` - ${customer.complement}` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Bairro:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${customer.neighborhood}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Cidade/UF:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${customer.city}/${customer.state}</td>
                </tr>
                ${customer.reference_point ? `
                <tr>
                  <td style="padding: 12px 20px; color: #64748B; font-size: 13px;">Ponto de Referência:</td>
                  <td style="padding: 12px 20px; color: #102833; font-size: 14px;">${customer.reference_point}</td>
                </tr>
                ` : ''}

                <!-- Status -->
                <tr>
                  <td colspan="2" style="padding: 15px 20px; border-top: 1px solid #E2E8F0;">
                    <span style="background-color: #FEF3C7; color: #92400E; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                      AGUARDANDO APROVAÇÃO
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${approveUrl}" style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 10px;">
                      APROVAR CADASTRO
                    </a>
                    <a href="${rejectUrl}" style="display: inline-block; padding: 14px 32px; background-color: #DC2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      REJEITAR CADASTRO
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px; text-align: center;">
                    <p style="margin: 0; color: #64748B; font-size: 12px;">
                      Clique no botão acima para realizar a ação diretamente.<br>
                      Ou copie e cole o link no navegador: ${approveUrl}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F1F5F9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #64748B; font-size: 12px;">
                Mensagem automática enviada pelo sistema LABTECH.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `Novo cliente aguardando aprovação | LABTECH`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao enviar e-mail de notificação:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao enviar e-mail' };
  }
}

// Enviar e-mail de aprovação para o cliente
export async function sendCustomerApprovalEmail(
  customer: CustomerData
): Promise<ApprovalResult> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const loginUrl = `${APP_URL}/login`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro Aprovado | LABTECH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4FBFD;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4FBFD; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #087A9F 0%, #0796C4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LABTECH</h1>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Tecnologia para Laboratórios</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <!-- Success Icon -->
              <div style="width: 80px; height: 80px; background-color: #D1FAE5; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg style="width: 40px; height: 40px; color: #059669;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 style="margin: 0 0 10px 0; color: #102833; font-size: 24px; font-weight: 600;">
                Cadastro Aprovado!
              </h2>
              <p style="margin: 0 0 20px 0; color: #102833; opacity: 0.7; font-size: 16px;">
                Olá, ${customer.representative_name.split(' ')[0]}!
              </p>
              <p style="margin: 0 0 30px 0; color: #102833; opacity: 0.7; font-size: 15px; line-height: 1.6;">
                Temos uma ótima notícia!<br>
                Seu cadastro na LABTECH foi analisado e aprovado com sucesso.
              </p>

              <!-- CTA Button -->
              <a href="${loginUrl}" style="display: inline-block; padding: 16px 40px; background-color: #087A9F; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ACESSAR MINHA CONTA
              </a>

              <p style="margin: 30px 0 0 0; color: #64748B; font-size: 13px;">
                Utilize o e-mail e a senha informados no cadastro para acessar.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F1F5F9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #64748B; font-size: 12px;">
                Se precisar de suporte, nossa equipe está à disposição.
              </p>
              <p style="margin: 10px 0 0 0; color: #64748B; font-size: 11px;">
                © ${new Date().getFullYear()} LABTECH - Tecnologia, precisão e confiança.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: customer.email,
      subject: 'Seu cadastro foi aprovado | LABTECH',
      html: htmlContent,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao enviar e-mail de aprovação:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao enviar e-mail' };
  }
}

// Enviar e-mail de rejeição para o cliente
export async function sendCustomerRejectionEmail(
  customer: CustomerData,
  reason?: string
): Promise<ApprovalResult> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro Reprovado | LABTECH</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4FBFD;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4FBFD; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #087A9F 0%, #0796C4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LABTECH</h1>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Tecnologia para Laboratórios</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <!-- Info Icon -->
              <div style="width: 80px; height: 80px; background-color: #FEE2E2; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg style="width: 40px; height: 40px; color: #DC2626;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h2 style="margin: 0 0 10px 0; color: #102833; font-size: 24px; font-weight: 600;">
                Cadastro Reprovado
              </h2>
              <p style="margin: 0 0 20px 0; color: #102833; opacity: 0.7; font-size: 16px;">
                Olá, ${customer.representative_name.split(' ')[0]}!
              </p>
              <p style="margin: 0 0 20px 0; color: #102833; opacity: 0.7; font-size: 15px; line-height: 1.6;">
                Infelizmente, seu cadastro na LABTECH não foi aprovado neste momento.
                ${reason ? `<br><br><strong>Motivo:</strong> ${reason}</p>` : ''}
              </p>

              <p style="margin: 0; color: #64748B; font-size: 13px;">
                Para mais informações, entre em contato com a equipe LABTECH.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F1F5F9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #64748B; font-size: 11px;">
                © ${new Date().getFullYear()} LABTECH - Tecnologia, precisão e confiança.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: customer.email,
      subject: 'Status do seu cadastro | LABTECH',
      html: htmlContent,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao enviar e-mail de rejeição:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao enviar e-mail' };
  }
}
