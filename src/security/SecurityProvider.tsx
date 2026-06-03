// security/SecurityProvider.tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Action, UserSession, IPermissionStrategy, SecurityContextValue } from './types';

const SecurityContext = createContext<SecurityContextValue | null>(null);

interface SecurityProviderProps {
  strategy: IPermissionStrategy;
  user: UserSession | null;
  children: ReactNode;
}

export const SecurityProvider = ({ strategy, user, children }: SecurityProviderProps) => {
  const value = useMemo<SecurityContextValue>(() => ({
    can:    (action, resource) => strategy.can(user, action, resource),
    canAny: (actions)          => strategy.canAny(user, actions),
    canAll: (actions)          => strategy.canAll(user, actions),
    user,
  }), [strategy, user]);

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextValue => {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
  return ctx;
};