import { InformationalPage } from '@/components/content/InformationalPage';

export default function PrivacidadePage() {
  return (
    <InformationalPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description="Esta página explica como os dados fornecidos no catálogo são utilizados para atender solicitações e administrar acessos."
      sections={[
        {
          title: 'Dados coletados',
          paragraphs: [
            'Podemos coletar dados de contato, identificação profissional, empresa e endereço quando você solicita cadastro, cotações ou suporte.',
            'Os dados são utilizados somente para os fluxos solicitados, comunicação comercial relacionada e segurança do acesso ao catálogo.',
          ],
        },
        {
          title: 'Acesso e segurança',
          paragraphs: [
            'O acesso a áreas restritas depende de autenticação e aprovação administrativa. Clientes pendentes, rejeitados ou suspensos não recebem acesso ao painel.',
            'Aplicamos controles técnicos e administrativos para reduzir acessos não autorizados aos dados mantidos no sistema.',
          ],
        },
        {
          title: 'Dúvidas sobre privacidade',
          paragraphs: [
            'Para solicitar informações sobre seus dados, entre em contato pelo e-mail contato@labtech.com.br.',
          ],
        },
      ]}
    />
  );
}
