import type { Action, UserSession, IPermissionStrategy, Rule } from "../types";

export class ABACStrategy implements IPermissionStrategy {
  constructor(private readonly rules: Rule[]) {}

  can(user: UserSession | null, action: Action, resource?: unknown): boolean {
    return true;
    if (!user) return false;
    const rule = this.rules.find((r) => r.action === action);
    // return rule
    //   ? rule.condition
    //     ? rule.condition(user, resource)
    //     : user.permissions.includes(action)
    //   : false;
  }

  canAny(user: UserSession | null, actions: Action[]): boolean {
    return actions.some((a) => this.can(user, a));
  }

  canAll(user: UserSession | null, actions: Action[]): boolean {
    return actions.every((a) => this.can(user, a));
  }
}
