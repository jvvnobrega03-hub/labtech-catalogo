'use client';

import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F4FBFD] flex items-center justify-center mb-4">
        {icon || <SearchX className="w-8 h-8 text-[#087A9F]" />}
      </div>
      <h3 className="text-lg font-semibold text-[#102833] mb-2">{title}</h3>
      {description && (
        <p className="text-[#102833]/60 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
