'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[#102833] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-2.5 pr-10 rounded-lg
              bg-white border border-[#D8EEF5]
              text-[#102833]
              appearance-none cursor-pointer
              transition-all duration-200
              focus:outline-none focus:border-[#087A9F] focus:ring-2 focus:ring-[#27C7FF]/20
              disabled:bg-[#F4FBFD] disabled:cursor-not-allowed
              ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#087A9F] pointer-events-none" />
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[#102833]/60">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
