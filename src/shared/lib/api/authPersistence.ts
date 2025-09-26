import { SessionData, UserSession } from "@/shared/types/session"
import { storageService, IStorageService } from "./storage"
import { USER_TYPE } from "@/shared/enums/session"

interface IAuthPersistence {
  initializeAuth(): SessionData | null
  clearAuthData(): void
  storeUserSessionData(session: SessionData): void
  getAuthToken(): string
  getRefreshToken(): string
  getAuthTokenExpirationDate(): string
  getRefreshTokenExpirationDate(): string
  getUserData(): UserSession | null
  getUserType(): USER_TYPE
  getUserProfile(): string
  getUserPermissions(): string[]
  getAppSettings(): any
  storeAppSettings(settings: any): void
  storeAuthToken(authToken: string): void
  storeRefreshToken(refreshToken: string): void
  storeAuthTokenExpirationDate(expirationDate: string): void
  storeRefreshTokenExpirationDate(expirationDate: string): void
  storeUserData(userData: UserSession): void
  storeUserType(userType: USER_TYPE): void
  storeUserProfile(userProfile: string): void
  storeUserPermissions(permissions: string[]): void
}

class AuthPersistence implements IAuthPersistence {
  private readonly KEYS = {
    USER_DATA: "@user_data",
    AUTH_TOKEN: "@auth_token",
    AUTH_TOKEN_EXPIRATION_DATE: "@auth_token_expiration_date",
    REFRESH_TOKEN: "@refresh_token",
    REFRESH_TOKEN_EXPIRATION_DATE: "@refresh_token_expiration_date",
    USER_PERMISSIONS: "@user_permissions",
    USER_TYPE: "@user_permissions",
    USER_PROFILE: "@user_profile",
    APP_SETTINGS: "@app_settings",
  } as const

  constructor(private readonly storage: IStorageService) {}

  initializeAuth(): SessionData | null {
    const userData = this.getUserData()
    if (!userData) return null

    return {
      userData: userData,
      userPermissions: this.getUserPermissions(),
      authToken: this.getAuthToken(),
      refreshToken: this.getRefreshToken(),
      authTokenExpirationDate: this.getAuthTokenExpirationDate(),
      refreshTokenExpirationDate: this.getRefreshTokenExpirationDate(),
      userType: this.getUserType(),
      userProfile: this.getUserProfile(),
    }
  }

  clearAuthData(): void {
    this.storage.clearSession()
    this.storage.removeLocaleItem(this.KEYS.USER_DATA)
    this.storage.removeLocaleItem(this.KEYS.AUTH_TOKEN)
    this.storage.removeLocaleItem(this.KEYS.AUTH_TOKEN_EXPIRATION_DATE)
    this.storage.removeLocaleItem(this.KEYS.REFRESH_TOKEN)
    this.storage.removeLocaleItem(this.KEYS.REFRESH_TOKEN_EXPIRATION_DATE)
    this.storage.removeLocaleItem(this.KEYS.USER_PERMISSIONS)
    this.storage.removeLocaleItem(this.KEYS.USER_TYPE)
    this.storage.removeLocaleItem(this.KEYS.USER_PROFILE)
  }

  storeUserSessionData(session: SessionData): void {
    try {
      this.storage.setLocaleItem(this.KEYS.REFRESH_TOKEN, session.refreshToken)
      this.storage.setLocaleItem(this.KEYS.REFRESH_TOKEN_EXPIRATION_DATE, session.refreshTokenExpirationDate)
      this.storage.setLocaleItem(this.KEYS.AUTH_TOKEN, session.authToken)
      this.storage.setLocaleItem(this.KEYS.AUTH_TOKEN_EXPIRATION_DATE, session.authTokenExpirationDate)
      this.storage.setSessionItem(this.KEYS.USER_DATA, session.userData)
      this.storage.setSessionItem(this.KEYS.USER_TYPE, session.userType)
      this.storage.setSessionItem(this.KEYS.USER_PROFILE, session.userProfile)
      this.storage.setSessionItem(this.KEYS.USER_PERMISSIONS, session.userPermissions)
    } catch (error) {
      console.error("Error storing auth data:", error)
      throw error
    }
  }

  getAuthToken(): string {
    return this.storage.getLocaleItem<string>(this.KEYS.AUTH_TOKEN) ?? ""
  }

  getRefreshToken(): string {
    return this.storage.getLocaleItem<string>(this.KEYS.REFRESH_TOKEN) ?? ""
  }

  getAuthTokenExpirationDate(): string {
    return this.storage.getLocaleItem<string>(this.KEYS.AUTH_TOKEN_EXPIRATION_DATE) ?? ""
  }

  getRefreshTokenExpirationDate(): string {
    return this.storage.getLocaleItem<string>(this.KEYS.REFRESH_TOKEN_EXPIRATION_DATE) ?? ""
  }

  getUserData(): UserSession | null {
    return this.storage.getSessionItem(this.KEYS.USER_DATA)
  }

  getUserType(): USER_TYPE {
    return this.storage.getSessionItem(this.KEYS.USER_TYPE) ?? USER_TYPE.COMPANY
  }

  getUserProfile(): string {
    return this.storage.getSessionItem(this.KEYS.USER_PROFILE) ?? ""
  }
  getUserPermissions(): string[] {
    return this.storage.getSessionItem<string[]>(this.KEYS.USER_PERMISSIONS) ?? []
  }

  getAppSettings(): any {
    return this.storage.getCookieItem(this.KEYS.APP_SETTINGS)
  }

  storeAppSettings(settings: any): void {
    this.storage.setCookieItem(this.KEYS.APP_SETTINGS, settings)
  }

  storeAuthToken(authToken: string): void {
    this.storage.setLocaleItem(this.KEYS.AUTH_TOKEN, authToken)
  }

  storeRefreshToken(refreshToken: string): void {
    this.storage.setLocaleItem(this.KEYS.REFRESH_TOKEN, refreshToken)
  }

  storeAuthTokenExpirationDate(expirationDate: string): void {
    this.storage.setLocaleItem(this.KEYS.AUTH_TOKEN_EXPIRATION_DATE, expirationDate)
  }

  storeRefreshTokenExpirationDate(expirationDate: string): void {
    this.storage.setLocaleItem(this.KEYS.REFRESH_TOKEN_EXPIRATION_DATE, expirationDate)
  }

  storeUserData(userData: UserSession): void {
    this.storage.setSessionItem(this.KEYS.USER_DATA, userData)
  }

  storeUserType(userType: USER_TYPE): void {
    this.storage.setSessionItem(this.KEYS.USER_TYPE, userType)
  }

  storeUserProfile(userProfile: string): void {
    this.storage.setSessionItem(this.KEYS.USER_PROFILE, userProfile)
  }

  storeUserPermissions(permissions: string[]): void {
    this.storage.setSessionItem(this.KEYS.USER_PERMISSIONS, permissions)
  }
}

export const authPersistence = new AuthPersistence(storageService)
