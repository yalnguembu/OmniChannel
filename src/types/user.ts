export enum EntityType {
  SYSTEM = "SYSTEM",
  CLIENT= "CLIENT",
}

export interface User{
  firstName?: string
  lastName: string
  email: string
  phoneNumber: string
  entityType: EntityType
}

export interface Session extends User {
  permissions: string[]
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
