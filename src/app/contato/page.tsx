import { InformationalPage } from '@/components/content/InformationalPage';

export default function ContatoPage() {
  return (
    <InformationalPage
      eyebrow="Contato"
      title="Fale com a LABTECH"
      description="Nossa equipe está pronta para ajudar você a encontrar produtos e soluções adequados à sua rotina."
      sections={[
        {
          title: 'Atendimento',
          paragraphs: [
            'Telefone: (11) 2941-5400',
            'E-mail: contato@labtech.com.br',
            'WhatsApp: (11) 2941-5400',
          ],
        },
        {
          title: 'Cotações e suporte técnico',
          paragraphs: [
            'Para receber atendimento sobre um produto específico, inclua o item, a quantidade desejada e os dados da sua empresa na solicitação de cotação.',
          ],
        },
      ]}
      cta={{ label: 'Ir para cotações', href: '/cotacao' }}
    />
  );
}
