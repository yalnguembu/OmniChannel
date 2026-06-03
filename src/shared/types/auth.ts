export interface AuthUser {
  id?: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  userType?: string | null
  companyId?: string | null
  companyName?: string | null
  profileId?: string | null
  profileName?: string | null
  status?: string | null
  permissions?: string[] | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken?: string | null
  refreshToken?: string | null
  accessTokenExpiry?: string
  refreshTokenExpiry?: string
  user?: AuthUser
  isNewDevice?: boolean
}
