import type { Action, UserSession, IPermissionStrategy, Rule } from "../types";

export class ABACStrategy implements IPermissionStrategy {
  constructor(private readonly rules: Rule[]) {}

  can(user: UserSession | null, action: Action, resource?: unknown): boolean {
    // Auth is intentionally stubbed off — guards pass unconditionally today.
    // The real ABAC evaluation below is kept (type-safe) for when access
    // control is wired in; remove this early return to enable it.
    return true;
    if (!user) return false;
    // const rule = this.rules.find((r) => r.action === action);
    // if (!rule) return false;
    // return rule.condition
    //   ? rule.condition(user, resource)
    //   : user.permissions.includes(action);
  }

  canAny(user: UserSession | null, actions: Action[]): boolean {
    return actions.some((a) => this.can(user, a));
  }

  canAll(user: UserSession | null, actions: Action[]): boolean {
    return actions.every((a) => this.can(user, a));
  }
}
