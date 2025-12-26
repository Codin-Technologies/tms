import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function Button({ className, children, variant = 'default', size = 'default', ...props }: ButtonProps) {
  const variants = {
    default: 'bg-teal-600 text-white hover:bg-teal-700',
    outline: 'border border-teal-600 text-teal-600 hover:bg-teal-50',
    ghost: 'hover:bg-gray-100 text-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1 text-sm',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'rounded-lg inline-flex items-center justify-center transition-colors font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
