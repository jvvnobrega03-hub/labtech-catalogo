import { CatalogWithSuspense } from '@/components/catalog/CatalogContent';

export const metadata = {
  title: 'Catálogo de Produtos - LABTECH',
  description: 'Explore todos os produtos laboratoriais, hospitalares e veterinários disponíveis. Encontre reagentes, equipamentos e soluções diagnósticas.',
};

export default function CatalogPage() {
  return <CatalogWithSuspense />;
}
