import { USER_TYPE } from "@/shared/enums/session"

export type UserSession = {
  id: string
  email: string
  fullName?: string
  publicId?: string
  firstName: string
  lastName: string
  status?: string
  companyId?: string
  companyName?: string
  profileId?: string
  profileName?: string
  permissions?: string[]
  createdAt?: string
  lastLoginAt?: string
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
