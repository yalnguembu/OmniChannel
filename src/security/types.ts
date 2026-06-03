import { ACTION } from "./enums"

export enum EntityType {
  SYSTEM = "SYSTEM",
  CLIENT= "CLIENT",
}


export type Action =  ACTION

export interface User{
  firstName?: string
  lastName: string
  email: string
  phoneNumber: string
  entityType: EntityType
}

export interface Session extends User {
  permissions: Action[]
  id: string
}

export interface JWTSession  extends Session{
  accessToken: string
  accessTokenExpirationDate: string
  refreshToken: string
  refreshTokenExpirationDate: string
}

export interface CookiesSession  extends Session {

}

export type UserSession = CookiesSession | JWTSession;

export interface IPermissionStrategy {
  can(user: UserSession | null, action: Action, resource?: unknown): boolean;
  canAny(user: UserSession | null, actions: Action[]): boolean;
  canAll(user: UserSession | null, actions: Action[]): boolean;
}

export interface SecurityContextValue {
  can(action: Action, resource?: unknown): boolean;
  canAny(actions: Action[]): boolean;
  canAll(actions: Action[]): boolean;
  user: UserSession | null;
}

export interface Rule {
  action: Action;
  condition?: (user: UserSession, resource?: unknown) => boolean;
}
