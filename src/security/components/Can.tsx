// security/Can.tsx
import type { ReactNode } from 'react';
import type { Action } from '../types';
import { useSecurity } from '../SecurityProvider';

interface CanProps {
  perform: Action;
  resource?: unknown;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ perform, resource, children, fallback = null }: CanProps) => {
  const { can } = useSecurity();
  return <>{can(perform, resource) ? children : fallback}</>;
};