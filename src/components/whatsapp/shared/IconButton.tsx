import React from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  label,
  active,
  className,
  ...props
}) => (
  <button
    aria-label={label}
    title={label}
    className={cn(
      'size-10 rounded-full flex cursor-pointer items-center justify-center text-wa-icon hover:bg-wa-active transition-colors flex-shrink-0',
      active && 'text-wa-teal bg-wa-active',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
