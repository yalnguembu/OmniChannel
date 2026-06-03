import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarInitialsProps {
  initials: string;
  background: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'size-8 text-sm',
  md: 'size-10 text-base',
  lg: 'size-12 text-lg',
};

export const AvatarInitials: React.FC<AvatarInitialsProps> = ({
  initials,
  background,
  size = 'md',
  className,
  onClick,
}) => (
  <div
    className={cn(
      'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 tracking-tight uppercase select-none',
      sizeClasses[size],
      onClick && 'cursor-pointer',
      className
    )}
    style={{ background }}
    onClick={onClick}
  >
    {initials}
  </div>
);
