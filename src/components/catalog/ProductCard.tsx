'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Eye, Check } from 'lucide-react';
import { Product } from '@/types';
import { useQuote } from '@/providers/QuoteProvider';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useQuote();

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    setTimeout(() => {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] || '',
        reference: product.reference,
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
    <Link href={`/produto/${product.slug}`}>
      <article className="group bg-white rounded-xl border border-[#D8EEF5] overflow-hidden card-hover flex flex-col h-full">
        {/* Image Container */}
        <div className="relative product-image-container p-6 flex items-center justify-center h-48">
          {/* Technical grid overlay */}
          <div className="absolute inset-0 scientific-grid opacity-50" />

          {/* Product Image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-4xl text-[#087A9F]/30 font-bold">
                {product.category.shortName.charAt(0)}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {product.isNew && <Badge variant="new">Novo</Badge>}
            {product.featured && !product.isNew && <Badge variant="info">Destaque</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <p className="text-xs font-medium text-[#087A9F] uppercase tracking-wider mb-2">
            {product.category.shortName}
          </p>

          {/* Name */}
          <h3 className="text-base font-semibold text-[#102833] mb-2 line-clamp-2 group-hover:text-[#087A9F] transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#102833]/60 mb-3 line-clamp-2 flex-1">
            {product.shortDescription}
          </p>

          {/* Reference */}
          <p className="text-xs text-[#102833]/50 mb-3">
            Ref: {product.reference}
          </p>

          {/* Availability */}
          <div className="mb-4">
            <span className={`text-sm font-medium ${
              product.availability === 'in-stock'
                ? 'text-emerald-600'
                : 'text-[#F59E0B]'
            }`}>
              {availabilityLabel[product.availability]}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleAddToQuote}
              disabled={isAdding || product.availability === 'out-of-stock'}
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
