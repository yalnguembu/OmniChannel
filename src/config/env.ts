export const env = {
  NODE_ENV: import.meta.env.NODE_ENV || "development",
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || "FujiPay",
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  VITE_ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS === "true",
} as const

export const isDevelopment = env.NODE_ENV === "development"
export const isProduction = env.NODE_ENV === "production"
export const isStaging = env.NODE_ENV === "staging"

const requiredEnvVars = ["VITE_API_BASE_URL"] as const

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}
