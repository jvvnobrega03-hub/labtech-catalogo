import { InformationalPage } from '@/components/content/InformationalPage';

export default function TermosPage() {
  return (
    <InformationalPage
      eyebrow="Termos de uso"
      title="Condições de uso do catálogo"
      description="Ao solicitar acesso e utilizar o catálogo LABTECH, você concorda com as condições descritas nesta página."
      sections={[
        {
          title: 'Solicitação de acesso',
          paragraphs: [
            'O envio do formulário não garante acesso imediato. Toda solicitação permanece pendente até a análise e aprovação de um administrador.',
            'As informações fornecidas devem ser verdadeiras, atualizadas e vinculadas à empresa ou ao profissional solicitante.',
          ],
        },
        {
          title: 'Uso do catálogo',
          paragraphs: [
            'O conteúdo do catálogo tem finalidade informativa e comercial. Disponibilidade, preços e condições são confirmados no processo de cotação.',
            'É proibido compartilhar credenciais, tentar acessar áreas sem permissão ou utilizar o sistema de forma que comprometa sua segurança e disponibilidade.',
          ],
        },
        {
          title: 'Atualizações',
          paragraphs: [
            'Estes termos podem ser atualizados para refletir mudanças operacionais, técnicas ou legais. O uso contínuo do catálogo após uma atualização representa concordância com a versão vigente.',
          ],
        },
      ]}
    />
  );
}
