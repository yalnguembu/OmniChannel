import { USER_TYPE } from "../enums/session"

export type UserSession = {
  id: string
  email: string
  fullName: string
  userType: string
  publicId?: string
}

export type SessionData = {
  userData: UserSession
  authToken: string
  authTokenExpirationDate: string
  refreshToken: string
  refreshTokenExpirationDate: string
  userType: USER_TYPE
  userProfile: string
  userPermissions: string[]
}
