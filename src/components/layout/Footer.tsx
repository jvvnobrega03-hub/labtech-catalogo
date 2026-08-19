'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, FileText, ArrowRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const categories = [
    { label: 'Coleta e Acondicionamento', href: '/catalogo?categoria=coleta' },
    { label: 'Equipamentos Laboratoriais', href: '/catalogo?categoria=equipamentos' },
    { label: 'Reagentes e Kits', href: '/catalogo?categoria=reagentes' },
    { label: 'Diagnóstico in vitro', href: '/catalogo?categoria=diagnostico' },
    { label: 'Vidrarias', href: '/catalogo?categoria=vidrarias' },
    { label: 'Biossegurança', href: '/catalogo?categoria=biosseguranca' },
  ];

  const institutional = [
    { label: 'Quem Somos', href: '/institucional' },
    { label: 'Nossas Soluções', href: '/solucoes' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Contato', href: '/contato' },
  ];

  return (
    <footer className="bg-[#071018] text-white">
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#087A9F] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight">LABTECH</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Produtos e soluções B2B para laboratórios, hospitais, clínicas e centros de pesquisa.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+551129415400"
                className="flex items-center gap-3 text-sm text-white/80 hover:text-[#27C7FF] transition-colors"
              >
                <Phone className="w-4 h-4" />
                (11) 2941-5400
              </a>
              <a
                href="mailto:contato@labtech.com.br"
                className="flex items-center gap-3 text-sm text-white/80 hover:text-[#27C7FF] transition-colors"
              >
                <Mail className="w-4 h-4" />
                contato@labtech.com.br
              </a>
              <a
                href="https://wa.me/551129415400"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/80 hover:text-[#27C7FF] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#27C7FF] mb-4">
              Categorias
            </h3>
            <ul className="space-y-3">
              {categories.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#27C7FF]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#27C7FF] mb-4">
              Institucional
            </h3>
            <ul className="space-y-3">
              {institutional.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#27C7FF]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#27C7FF] mb-4">
              Atendimento
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Precisa de ajuda para encontrar o produto certo?
            </p>
            <Link
              href="/cotacao"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Solicitar Cotação
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            © {currentYear} Labtech® — Produtos para laboratórios e hospitais.
          </p>
          <p className="text-sm text-white/50">
            CNPJ: 02.419.460/0001-84
          </p>
        </div>
      </div>
    </footer>
  );
}
