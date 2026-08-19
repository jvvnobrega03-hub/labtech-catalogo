'use client';

import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-all duration-200
              flex items-center justify-center
              ${error
                ? 'border-[#EF4444] peer-checked:bg-[#EF4444]'
                : 'border-[#D8EEF5] peer-checked:bg-[#087A9F] peer-checked:border-[#087A9F]'
              }
              peer-focus-visible:ring-2 peer-focus-visible:ring-[#0AA6D2] peer-focus-visible:ring-offset-2
              peer-checked:text-white
            `}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className={`
              text-sm cursor-pointer select-none
              ${error ? 'text-[#EF4444]' : 'text-[#102833]'}
              ${className}
            `}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
