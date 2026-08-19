'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Eye, Check } from 'lucide-react';
import { Product } from '@/types';
import { useQuote } from '@/providers/QuoteProvider';
import { Badge } from '@/components/ui/Badge';

// Tipos para dados vindos do banco (Supabase)
interface DbProduct {
  id: string;
  slug: string;
  name: string;
  reference: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  is_featured: boolean;
  is_new: boolean;
  availability: string;
  stock_quantity: number;
  minimum_stock: number;
  is_consult_only: boolean;
  main_image_url: string | null;
  gallery_urls: string[];
  keywords: string[];
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    short_name: string | null;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
}

type ProductCardProps = {
  product: Product | DbProduct;
};

// Helper para normalizar produto do banco para formato do componente
function normalizeProduct(product: Product | DbProduct): Product {
  // Se já tem o formato do tipo Product (tem 'category' como objeto Category)
  if ('shortDescription' in product) {
    return product as Product;
  }

  // Normaliza produto do banco para formato esperado
  const dbProduct = product as DbProduct;
  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    reference: dbProduct.reference,
    shortDescription: dbProduct.short_description || '',
    description: dbProduct.description || '',
    category: {
      id: dbProduct.category?.id || '',
      slug: dbProduct.category?.slug || '',
      name: dbProduct.category?.name || '',
      shortName: dbProduct.category?.short_name || dbProduct.category?.name?.substring(0, 3) || '',
      description: '',
      icon: '',
      index: 0,
      productCount: 0
    },
    applications: [],
    segment: [],
    brand: dbProduct.brand?.name,
    images: dbProduct.main_image_url ? [dbProduct.main_image_url] : [],
    specifications: [],
    documents: [],
    relatedProducts: [],
    complementaryProducts: [],
    featured: dbProduct.is_featured,
    isNew: dbProduct.is_new,
    availability: dbProduct.availability as 'consult' | 'in-stock' | 'out-of-stock',
    keywords: dbProduct.keywords || []
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useQuote();

  // Normaliza produto para formato padrão
  const normalizedProduct = normalizeProduct(product);

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    setTimeout(() => {
      addItem({
        productId: normalizedProduct.id,
        slug: normalizedProduct.slug,
        name: normalizedProduct.name,
        image: normalizedProduct.images[0] || '',
        reference: normalizedProduct.reference,
        quantity: 1,
      });
      setIsAdding(false);
      setIsAdded(true);

      setTimeout(() => setIsAdded(false), 2000);
    }, 500);
  };

  const availabilityLabel = {
    consult: 'Sob consulta',
    'in-stock': 'Em estoque',
    'out-of-stock': 'Indisponível',
  };

  return (
    <Link href={`/produto/${normalizedProduct.slug}`}>
      <article className="group bg-white rounded-xl border border-[#D8EEF5] overflow-hidden card-hover flex flex-col h-full">
        {/* Image Container */}
        <div className="relative product-image-container p-6 flex items-center justify-center h-48">
          {/* Technical grid overlay */}
          <div className="absolute inset-0 scientific-grid opacity-50" />

          {/* Product Image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {normalizedProduct.images[0] ? (
              <Image
                src={normalizedProduct.images[0]}
                alt={normalizedProduct.name}
                width={120}
                height={120}
                className="object-contain"
              />
            ) : (
              <div className="w-32 h-32 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-4xl text-[#087A9F]/30 font-bold">
                  {normalizedProduct.category.shortName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {normalizedProduct.isNew && <Badge variant="new">Novo</Badge>}
            {normalizedProduct.featured && !normalizedProduct.isNew && <Badge variant="info">Destaque</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <p className="text-xs font-medium text-[#087A9F] uppercase tracking-wider mb-2">
            {normalizedProduct.category.shortName}
          </p>

          {/* Name */}
          <h3 className="text-base font-semibold text-[#102833] mb-2 line-clamp-2 group-hover:text-[#087A9F] transition-colors">
            {normalizedProduct.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#102833]/60 mb-3 line-clamp-2 flex-1">
            {normalizedProduct.shortDescription}
          </p>

          {/* Reference */}
          <p className="text-xs text-[#102833]/50 mb-3">
            Ref: {normalizedProduct.reference}
          </p>

          {/* Availability */}
          <div className="mb-4">
            <span className={`text-sm font-medium ${
              normalizedProduct.availability === 'in-stock'
                ? 'text-emerald-600'
                : 'text-[#F59E0B]'
            }`}>
              {availabilityLabel[normalizedProduct.availability]}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleAddToQuote}
              disabled={isAdding || normalizedProduct.availability === 'out-of-stock'}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isAdded
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#087A9F] text-white hover:bg-[#0796C4]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAdding ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Adicionado
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Cotação
                </>
              )}
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="p-2.5 rounded-lg border border-[#D8EEF5] text-[#087A9F] hover:bg-[#F4FBFD] transition-colors"
              aria-label="Ver produto"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
