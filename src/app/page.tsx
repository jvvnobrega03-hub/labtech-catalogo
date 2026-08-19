'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { categories, applications, products } from '@/data/mock';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?busca=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#071018] overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute inset-0 scientific-grid opacity-20" />

        {/* Orbital elements */}
        <div className="absolute top-20 right-10 w-64 h-64 border border-[#27C7FF]/20 rounded-full animate-[spin_30s_linear_infinite]" />
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-[#27C7FF]/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-[#27C7FF] rounded-full opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#0796C4] rounded-full opacity-40" />

        <div className="relative max-w-[1400px] mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="text-[#27C7FF] text-sm font-bold uppercase tracking-[0.2em] mb-4 animate-fade-in">
              Catálogo LABTECH
            </p>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight text-balance animate-slide-up">
              Encontre a solução certa para sua rotina diagnóstica
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl animate-slide-up animation-delay-100">
              Explore produtos laboratoriais, hospitalares, veterinários e soluções para diagnóstico organizadas por categoria, aplicação e necessidade técnica.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="animate-slide-up animation-delay-200">
              <div className="max-w-xl">
                <SearchInput
                  placeholder="Busque por produto, referência, categoria ou aplicação..."
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
                  <Link href="/catalogo">
                    <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                      Explorar categorias
                    </Button>
                  </Link>
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
            eyebrow="Navegue por categoria"
            title="Principais categorias"
            description="Encontre rapidamente o produto ideal para sua necessidade"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CategoryCard category={category} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/catalogo">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver todas as categorias
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-16 md:py-24 bg-[#F4FBFD]">
        <div className="max-w-[1400px] mx-auto px-4">
          <SectionHeading
            eyebrow="Por aplicação"
            title="Encontre por necessidade"
            description="Produtos organizados pela aplicação que você precisa"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.slice(0, 6).map((app, index) => (
              <Link
                key={app.id}
                href={`/catalogo?aplicacao=${app.slug}`}
                className="group flex items-start gap-4 p-6 bg-white rounded-xl border border-[#D8EEF5] hover:border-[#087A9F] transition-all card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-[#F4FBFD] flex items-center justify-center flex-shrink-0 group-hover:bg-[#087A9F] transition-colors">
                  <Sparkles className="w-6 h-6 text-[#087A9F] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#102833] mb-1 group-hover:text-[#087A9F] transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-sm text-[#102833]/60">
                    {app.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#087A9F] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4">
          <SectionHeading
            eyebrow="Destaques"
            title="Produtos em destaque"
            description="Seleção dos produtos mais procurados para seu laboratório"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
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
            <Link href="/catalogo">
              <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver todos os produtos
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
            Precisa de ajuda para escolher?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Nossa equipe técnica está pronta para auxiliá-lo na seleção dos produtos ideais para sua aplicação.
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
