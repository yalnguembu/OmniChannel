// Global types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "user" | "admin"
  createdAt: string
  updatedAt: string
}

export interface Theme {
  mode: "light" | "dark"
  primaryColor: string
}

export interface AppConfig {
  name: string
  version: string
  apiUrl: string
  environment: "development" | "staging" | "production"
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
