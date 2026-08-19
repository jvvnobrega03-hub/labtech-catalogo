'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Minus, Plus, Share2, FileText, Download, ExternalLink, Phone, Mail } from 'lucide-react';
import { getProductBySlug, getRelatedProducts, getComplementaryProducts } from '@/lib/search';
import { useQuote } from '@/providers/QuoteProvider';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);
  const { addItem, toggleDrawer } = useQuote();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#102833] mb-4">Produto não encontrado</h1>
          <Link href="/catalogo">
            <Button>Voltar ao catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(slug, 4);
  const complementaryProducts = getComplementaryProducts(slug, 4);

  const handleAddToQuote = () => {
    setIsAdding(true);
    setTimeout(() => {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] || '',
        reference: product.reference,
        quantity,
      });
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const documentIcons: Record<string, string> = {
    'technical-sheet': '📋',
    'manual': '📖',
    'certificate': '📜',
    'catalog': '📚',
    'instructions': '📝',
  };

  const availabilityLabel = {
    consult: 'Disponibilidade sob consulta',
    'in-stock': 'Em estoque',
    'out-of-stock': 'Indisponível',
  };

  return (
    <div className="min-h-screen bg-[#F4FBFD]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#D8EEF5]">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Catálogo', href: '/catalogo' },
              { label: product.category.name, href: `/catalogo?categoria=${product.category.slug}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      {/* Product Main Section */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-xl border border-[#D8EEF5] p-8 aspect-square flex items-center justify-center">
              <div className="w-64 h-64 bg-[#EDF9FC] rounded-lg flex items-center justify-center">
                <span className="text-8xl text-[#087A9F]/30 font-bold">
                  {product.category.shortName.charAt(0)}
                </span>
              </div>
            </div>
            {/* Thumbnails (placeholder) */}
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg border-2 transition-all ${
                    selectedImage === i
                      ? 'border-[#087A9F]'
                      : 'border-[#D8EEF5] hover:border-[#087A9F]/50'
                  }`}
                >
                  <div className="w-full h-full bg-[#EDF9FC] flex items-center justify-center">
                    <span className="text-2xl text-[#087A9F]/30 font-bold">
                      {product.category.shortName.charAt(0)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[#087A9F] uppercase tracking-wider">
                {product.category.name}
              </span>
              {product.isNew && <Badge variant="new">Novo</Badge>}
              {product.featured && !product.isNew && <Badge variant="info">Destaque</Badge>}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#102833]">
              {product.name}
            </h1>

            {/* Reference */}
            <p className="text-[#102833]/60">
              Código de referência: <span className="font-mono font-medium">{product.reference}</span>
            </p>

            {/* Short Description */}
            <p className="text-lg text-[#102833]/80">
              {product.shortDescription}
            </p>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {product.availability === 'in-stock' ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Badge variant="warning">Sob consulta</Badge>
              )}
              <span className={`font-medium ${
                product.availability === 'in-stock' ? 'text-emerald-600' : 'text-[#F59E0B]'
              }`}>
                {availabilityLabel[product.availability]}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#102833]">Quantidade:</span>
              <div className="flex items-center border border-[#D8EEF5] rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                fullWidth
                onClick={handleAddToQuote}
                isLoading={isAdding}
                leftIcon={isAdded ? <Check className="w-5 h-5" /> : undefined}
              >
                {isAdded ? 'Adicionado à cotação' : 'Adicionar à cotação'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Phone className="w-5 h-5" />}
              >
                Falar com especialista
              </Button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-[#102833]/60 hover:text-[#087A9F] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar produto
            </button>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-white rounded-xl border border-[#D8EEF5] p-6 md:p-8">
          <Tabs
            tabs={[
              {
                id: 'overview',
                label: 'Visão Geral',
                content: (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-[#102833]/80 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="mt-6">
                      <h4 className="font-semibold text-[#102833] mb-3">Aplicações</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.applications.map((app) => (
                          <Badge key={app} variant="default">{app}</Badge>
                        ))}
                      </div>
                    </div>
                    {product.brand && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-[#102833] mb-3">Marca</h4>
                        <p className="text-[#102833]/80">{product.brand}</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                id: 'specs',
                label: 'Especificações',
                content: (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-[#D8EEF5]">
                        {product.specifications.map((spec, index) => (
                          <tr key={index} className="hover:bg-[#F4FBFD]">
                            <td className="py-3 pr-4 font-medium text-[#102833] w-1/3">
                              {spec.label}
                            </td>
                            <td className="py-3 text-[#102833]/80">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                id: 'documents',
                label: 'Documentos',
                content: (
                  <div className="space-y-3">
                    {product.documents.length > 0 ? (
                      product.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-[#F4FBFD] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {documentIcons[doc.type] || '📄'}
                            </span>
                            <div>
                              <p className="font-medium text-[#102833]">{doc.name}</p>
                              <p className="text-xs text-[#102833]/60">{doc.size}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
                              Visualizar
                            </Button>
                            <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                              Baixar
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#102833]/60 text-center py-8">
                        Nenhum documento disponível para este produto
                      </p>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Produtos relacionados"
              title="Você também pode interessar"
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Complementary Products */}
        {complementaryProducts.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Produtos complementares"
              title="Complete sua solução"
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {complementaryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
