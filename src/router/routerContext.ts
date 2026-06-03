import type { IPermissionStrategy, UserSession } from '../security/types';

export interface RouterContext {
  user: UserSession | null;
  strategy: IPermissionStrategy;
}