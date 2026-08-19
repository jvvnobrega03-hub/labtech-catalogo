'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useQuote } from '@/providers/QuoteProvider';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';

export function QuoteDrawer() {
  const { items, isOpen, toggleDrawer, removeItem, updateQuantity, itemCount } = useQuote();

  const handleCheckout = () => {
    toggleDrawer(false);
  };

  return (
    <Drawer isOpen={isOpen} onClose={() => toggleDrawer(false)} title="Minha cotação">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#F4FBFD] flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-[#087A9F]" />
          </div>
          <h3 className="text-lg font-semibold text-[#102833] mb-2">
            Sua cotação está vazia
          </h3>
          <p className="text-sm text-[#102833]/60 mb-6">
            Adicione produtos para solicitar uma cotação
          </p>
          <Button onClick={() => toggleDrawer(false)} variant="outline">
            Continuar navegando
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-[#F4FBFD] rounded-lg"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D8EEF5]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#D8EEF5] rounded" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produto/${item.slug}`}
                    onClick={() => toggleDrawer(false)}
                    className="text-sm font-medium text-[#102833] hover:text-[#087A9F] line-clamp-2 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-[#102833]/60 mt-1">
                    Ref: {item.reference}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#D8EEF5] rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-[#102833]/40 hover:text-[#EF4444] transition-colors"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-[#D8EEF5] p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#102833]/60">
                Total de itens
              </span>
              <span className="text-lg font-semibold text-[#102833]">
                {itemCount}
              </span>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Revisar cotação
              </Button>
              <Button
                onClick={() => toggleDrawer(false)}
                variant="ghost"
                fullWidth
              >
                Continuar navegando
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
