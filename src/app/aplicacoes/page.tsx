'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ChevronRight } from 'lucide-react';
import { applications, products } from '@/data/mock';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default function AplicacoesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?busca=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const filteredProducts = selectedApplication
    ? products.filter(p => p.applications.includes(selectedApplication)).slice(0, 8)
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#071018] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute inset-0 scientific-grid opacity-20" />

        <div className="relative max-w-[1400px] mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="text-[#27C7FF] text-sm font-bold uppercase tracking-[0.2em] mb-4 animate-fade-in">
              Aplicações
            </p>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight text-balance">
              Encontre produtos por aplicação
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl">
              Navegue pelos produtos organizados pela aplicação que você precisa para sua rotina laboratorial.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="animate-slide-up">
              <div className="max-w-xl">
                <SearchInput
                  placeholder="Buscar por produto, referência ou categoria..."
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
                    Buscar
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Applications Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4">
          <SectionHeading
            eyebrow="Todas as aplicações"
            title="Navegue por necessidade"
            description="Clique em uma aplicação para ver os produtos relacionados"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app, index) => (
              <button
                key={app.id}
                onClick={() => setSelectedApplication(selectedApplication === app.id ? null : app.id)}
                className={`group flex items-start gap-4 p-6 text-left rounded-xl border transition-all card-hover ${
                  selectedApplication === app.id
                    ? 'bg-[#087A9F] border-[#087A9F] text-white'
                    : 'bg-white border-[#D8EEF5] hover:border-[#087A9F]'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedApplication === app.id ? 'bg-white/20' : 'bg-[#F4FBFD] group-hover:bg-[#087A9F]'
                }`}>
                  <ChevronRight className={`w-6 h-6 ${
                    selectedApplication === app.id ? 'text-white' : 'text-[#087A9F] group-hover:text-white'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${
                    selectedApplication === app.id ? 'text-white' : 'text-[#102833] group-hover:text-[#087A9F]'
                  }`}>
                    {app.name}
                  </h3>
                  <p className={`text-sm ${
                    selectedApplication === app.id ? 'text-white/70' : 'text-[#102833]/60'
                  }`}>
                    {app.description}
                  </p>
                  <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${
                    selectedApplication === app.id ? 'text-white' : 'text-[#087A9F]'
                  } opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span>Ver produtos</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products for Selected Application */}
      {selectedApplication && (
        <section className="py-16 md:py-24 bg-[#F4FBFD]">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-[#087A9F] text-sm font-bold uppercase tracking-[0.15em] mb-2">
                  Produtos relacionados
                </p>
                <h2 className="text-3xl font-extrabold text-[#102833]">
                  {applications.find(a => a.id === selectedApplication)?.name}
                </h2>
              </div>
              <Link href={`/catalogo?aplicacao=${selectedApplication}`}>
                <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Ver todos
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="text-center text-[#102833]/60 py-8">
                Nenhum produto encontrado para esta aplicação
              </p>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#071018] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-[1400px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Não sabe qual produto precisa?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Nossa equipe técnica pode ajudá-lo a encontrar a melhor solução para sua aplicação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotacao">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Solicitar orientação
              </Button>
            </Link>
            <a href="tel:+551129415400">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Ligar agora
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
