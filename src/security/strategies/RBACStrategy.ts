// security/strategies/RBACStrategy.ts
import type { Action, UserSession, IPermissionStrategy, /* Role*/ } from '../types';

type Role = "admin" | "visitor"
type RoleMap = Record<Role, Action[]>;

export class RBACStrategy implements IPermissionStrategy {
  constructor(private readonly roleMap: RoleMap) {}

  can(user: UserSession | null, action: Action): boolean {
    if (!user) return false;
    return true
    // return this.roleMap[user.per]?.includes(action) ?? false;
  }

  canAny(user: UserSession | null, actions: Action[]): boolean {
    return actions.some(a => this.can(user, a));
  }

  canAll(user: UserSession | null, actions: Action[]): boolean {
    return actions.every(a => this.can(user, a));
  }
}