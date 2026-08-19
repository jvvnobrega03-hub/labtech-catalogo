'use client';

import React from 'react';
import Link from 'next/link';
import {
  TestTube,
  FlaskConical,
  Beaker,
  ClipboardList,
  CircleDot,
  HeartPulse,
  Microscope,
  Archive,
  Shield,
  ArrowRight,
  Droplets,
} from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TestTube,
  FlaskConical,
  Beaker,
  ClipboardList,
  CircleDot,
  HeartPulse,
  Microscope,
  Archive,
  Shield,
  Droplets,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || TestTube;

  return (
    <Link href={`/catalogo?categoria=${category.slug}`}>
      <article className="group bg-white rounded-xl border border-[#D8EEF5] p-6 card-hover h-full">
        <div className="flex flex-col h-full">
          {/* Index & Icon */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-3xl font-extrabold text-[#D8EEF5]">
              {String(category.index).padStart(2, '0')}
            </span>
            <div className="w-12 h-12 rounded-lg bg-[#F4FBFD] flex items-center justify-center group-hover:bg-[#087A9F] transition-colors">
              <Icon className="w-6 h-6 text-[#087A9F] group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Name */}
          <h3 className="text-lg font-semibold text-[#102833] mb-2 group-hover:text-[#087A9F] transition-colors">
            {category.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#102833]/60 mb-4 flex-1">
            {category.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#D8EEF5]">
            <span className="text-xs font-medium text-[#087A9F]">
              {category.productCount} produtos
            </span>
            <div className="flex items-center gap-1 text-[#087A9F] opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium">Ver produtos</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
