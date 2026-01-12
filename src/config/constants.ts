import { env } from "./env"

// Helper to check if we're in production
const isProduction = env.NODE_ENV === "production"

// App constants
export const APP_CONFIG = {
  name: env.VITE_APP_NAME,
  version: env.VITE_APP_VERSION,
  description: "Your payment solution template",
  author: "templateweb Team",
  repository: "https://github.com/templateweb/template-web",
} as const

// Feature flags
export const FEATURE_FLAGS = {
  enableDarkMode: true,
  enableNotifications: true,
  enableAnalytics: isProduction,
  enableErrorReporting: isProduction,
  enableDevtools: env.VITE_ENABLE_DEVTOOLS,
} as const

// UI constants
export const UI_CONSTANTS = {
  maxContentWidth: "1200px",
  sidebarWidth: "240px",
  headerHeight: "64px",
  mobileBreakpoint: "768px",
} as const

// Storage prefixes
export const STORAGE_PREFIX = "templateweb_"

// Query keys
export const QUERY_KEYS = {
  auth: ["auth"] as const,
  user: (id: string) => ["user", id] as const,
  users: (params?: Record<string, any>) => ["users", params] as const,
} as const

// Cache times (in milliseconds)
export const CACHE_TIME = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  long: 60 * 60 * 1000, // 1 hour
} as const
