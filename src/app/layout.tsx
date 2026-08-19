import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { QuoteProvider } from '@/providers/QuoteProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QuoteDrawer } from '@/components/catalog/QuoteDrawer';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LABTECH - Catálogo de Produtos Laboratoriais',
  description: 'Catálogo digital de produtos laboratoriais, hospitalares, diagnósticos e veterinários. Encontre soluções para sua rotina diagnóstica.',
  keywords: ['produtos laboratoriais', 'diagnóstico', 'laboratório', 'hospitalar', 'veterinário', 'reagentes', 'equipamentos'],
  openGraph: {
    title: 'LABTECH - Catálogo de Produtos Laboratoriais',
    description: 'Catálogo digital de produtos laboratoriais, hospitalares, diagnósticos e veterinários.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'LABTECH',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body className="min-h-screen flex flex-col bg-white">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <AuthProvider>
          <QuoteProvider>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <QuoteDrawer />
          </QuoteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
