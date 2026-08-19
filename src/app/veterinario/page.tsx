'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, PawPrint, TestTube, Stethoscope, FlaskConical } from 'lucide-react';
import { products } from '@/data/mock';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default function VeterinarioPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products that can be used in veterinary segment
  const vetProducts = products.filter(p =>
    p.segment.includes('veterinario') ||
    p.applications.includes('diagnostico-veterinario')
  ).slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?busca=${encodeURIComponent(searchQuery.trim())}&segmento=veterinario`;
    }
  };

  const vetCategories = [
    {
      icon: TestTube,
      name: 'Coleta',
      description: 'Tubos, agulhas e sistemas de coleta para amostras animais',
      href: '/catalogo?categoria=coleta-acondicionamento&segmento=veterinario',
    },
    {
      icon: FlaskConical,
      name: 'Reagentes',
      description: 'Kits diagnósticos e reagentes para análises veterinárias',
      href: '/catalogo?categoria=reagentes-kits&segmento=veterinario',
    },
    {
      icon: Stethoscope,
      name: 'Diagnóstico',
      description: 'Testes rápidos e equipamentos para diagnóstico',
      href: '/catalogo?categoria=diagnostico-in-vitro&segmento=veterinario',
    },
    {
      icon: PawPrint,
      name: 'Equipamentos',
      description: 'Equipamentos específicos para clínicas veterinárias',
      href: '/catalogo?categoria=equipamentos-laboratoriais&segmento=veterinario',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#071018] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute inset-0 scientific-grid opacity-20" />

        {/* Paw print elements */}
        <div className="absolute top-20 right-20 text-[#27C7FF]/10 text-9xl font-bold select-none">
          🐾
        </div>
        <div className="absolute bottom-20 left-10 text-[#27C7FF]/10 text-7xl font-bold select-none">
          🐕
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="text-[#27C7FF] text-sm font-bold uppercase tracking-[0.2em] mb-4 animate-fade-in">
              Veterinário
            </p>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight text-balance">
              Soluções para diagnóstico veterinário
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl">
              Produtos especializados para clínicas veterinárias, hospitais动物 e laboratórios de análise diagnóstica. Qualidade profissional para cuidar da saúde animal.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="animate-slide-up">
              <div className="max-w-xl">
                <SearchInput
                  placeholder="Buscar produtos veterinários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  showClear={!!searchQuery}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white focus:text-[#102833]"
                />
                <div className="flex gap-3 mt-4">
                  <Button
                    type="submit"
                    size="lg"
                    rightIcon={<Search className="w-5 h-5" />}
                  >
                    Buscar produtos
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4">
          <SectionHeading
            eyebrow="Por categoria"
            title="Produtos para veterinária"
            description="Encontre o que você precisa para sua clínica ou laboratório"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vetCategories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="group p-6 bg-white rounded-xl border border-[#D8EEF5] hover:border-[#087A9F] transition-all card-hover animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-[#F4FBFD] flex items-center justify-center mb-4 group-hover:bg-[#087A9F] transition-colors">
                    <Icon className="w-7 h-7 text-[#087A9F] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#102833] mb-2 group-hover:text-[#087A9F] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-[#102833]/60">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-1 text-[#087A9F] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Ver produtos</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24 bg-[#F4FBFD]">
        <div className="max-w-[1400px] mx-auto px-4">
          <SectionHeading
            eyebrow="Produtos recomendados"
            title="Destaques para veterinária"
            description="Seleção de produtos mais utilizados em diagnósticos animais"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vetProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/catalogo?segmento=veterinario">
              <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver todos os produtos veterinários
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#071018] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-[1400px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Precisa de ajuda especializada?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Nossa equipe tem experiência em soluções para diagnóstico veterinário. Entre em contato para orientações técnicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotacao">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Solicitar cotação
              </Button>
            </Link>
            <a href="tel:+551129415400">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Falar com especialista
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
