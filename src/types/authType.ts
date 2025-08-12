export type AuthType = {
  id?: string | number
  uuid?: string
  username?: string
  firstname?: string
  lastname?: string
  status?: string
  userType?: string
  phone?: string
  email?: string
  address?: string
  firstLogin?: boolean
  step?: number
  createdBy: string | null
  photo: string | null
  city: string
  neighborhood: string
  role: {
    id: number
    roleName: string
    menuPermission: Array<{
      id: string
      name: string
      create: boolean
      read: boolean
      update: boolean
      delete: boolean
      createdAt: string
      specificPermissions: Array<{
        id: string
        name: string | null
        description: string | null
        grant: boolean
      }>
    }>
  }
}

export type VerificationObjectType = {
  uuid: string
  guid: string
  minBeforeExpire: number
  role: string
  expiresAt: string
  createdAt: string
  phoneNumber: string
  email: string
}

export type CustomType = {
  verificationObject: VerificationObjectType
  verificationType: string
  trials: number
  maxTrials: number
}

export type LoginResponseType = {
  message: string
  data: {
    user: AuthType
    custom: CustomType
  }
  timestamp: string
  status: number
  isSuccess: boolean
}

export type RefreshTokenResponseType = {
  message: string
  data: string // Simple string response
  timestamp: string
  status: number
  isSuccess: boolean
}

export type LoginType = {
  username: string
  password: string
}

export type OtpType = {
  otp: string
}

export type SetPasswordType = {
  newPassword: string
  confirmPassword: string
}
