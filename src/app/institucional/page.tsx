import { InformationalPage } from '@/components/content/InformationalPage';

export default function InstitucionalPage() {
  return (
    <InformationalPage
      eyebrow="Institucional"
      title="Soluções que apoiam a rotina diagnóstica"
      description="A LABTECH oferece produtos e suporte para laboratórios, hospitais, clínicas e centros de pesquisa que buscam segurança, qualidade e continuidade operacional."
      sections={[
        {
          title: 'Nossa atuação',
          paragraphs: [
            'Desde 1997, trabalhamos para aproximar equipes técnicas de soluções laboratoriais, hospitalares, diagnósticas e veterinárias.',
            'Nosso catálogo reúne itens para diferentes etapas da rotina analítica, da coleta ao processamento e à documentação técnica.',
          ],
        },
        {
          title: 'Compromisso com o atendimento',
          paragraphs: [
            'Cada solicitação é analisada considerando a aplicação, a disponibilidade dos itens e as necessidades do cliente.',
            'Nossa equipe está disponível para orientar a escolha de produtos e apoiar processos de cotação.',
          ],
        },
      ]}
      cta={{ label: 'Conhecer o catálogo', href: '/catalogo' }}
    />
  );
}
