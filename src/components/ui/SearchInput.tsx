'use client';

import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showClear?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, showClear, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#087A9F]" />
        <input
          ref={ref}
          type="search"
          className={`
            w-full pl-11 pr-10 py-3 rounded-lg
            bg-white border border-[#D8EEF5]
            text-[#102833] placeholder:text-[#102833]/50
            transition-all duration-200
            focus:outline-none focus:border-[#087A9F] focus:ring-2 focus:ring-[#27C7FF]/20
            ${className}
          `}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#102833]/40 hover:text-[#087A9F] transition-colors"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
