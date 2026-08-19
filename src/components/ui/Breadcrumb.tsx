'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="flex items-center gap-1 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Início</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-[#D8EEF5]" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-[#102833]/60 hover:text-[#087A9F] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#102833] font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
