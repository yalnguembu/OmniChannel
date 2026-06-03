// security/guards.ts
import { redirect } from '@tanstack/react-router';
import type { Action, UserSession, IPermissionStrategy } from './types';

interface GuardOptions {
  action: Action;
  resource?: unknown;
  redirectTo?: string;
}

export function requirePermission(
  user: UserSession | null,
  strategy: IPermissionStrategy,
  { action, resource, redirectTo = '/403' }: GuardOptions,
) {
  if (!strategy.can(user, action, resource)) {
    throw redirect({ to: redirectTo });
  }
}