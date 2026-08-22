import { InformationalPage } from '@/components/content/InformationalPage';

export default function SolucoesPage() {
  return (
    <InformationalPage
      eyebrow="Soluções"
      title="Produtos para cada etapa da sua operação"
      description="Organizamos soluções para tornar a busca por produtos laboratoriais mais simples, técnica e adequada à sua necessidade."
      sections={[
        {
          title: 'Coleta e acondicionamento',
          paragraphs: [
            'Encontre materiais para coleta, transporte e conservação de amostras com foco em rastreabilidade e segurança.',
          ],
        },
        {
          title: 'Diagnóstico e rotina laboratorial',
          paragraphs: [
            'Seleções de reagentes, kits, equipamentos, vidrarias e consumíveis para diferentes aplicações analíticas.',
          ],
        },
        {
          title: 'Atendimento especializado',
          paragraphs: [
            'Caso não localize o item desejado, solicite uma cotação para que a equipe LABTECH avalie a melhor alternativa.',
          ],
        },
      ]}
      cta={{ label: 'Solicitar cotação', href: '/cotacao' }}
    />
  );
}
