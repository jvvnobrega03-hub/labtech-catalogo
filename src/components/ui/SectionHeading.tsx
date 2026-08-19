'use client';

import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`mb-10 ${align === 'center' ? 'text-center' : ''} ${className}`}>
      {eyebrow && (
        <p className="text-[#087A9F] text-sm font-bold uppercase tracking-[0.15em] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#102833] mb-4 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-[#102833]/70 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
