/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  if (!str) return str
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
}

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * Convert camelCase to snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1_$2").toLowerCase()
}

/**
 * Convert snake_case to camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * Remove HTML tags from string
 */
export const stripHtml = (str: string): string => {
  if (!str) return str
  return str.replace(/<[^>]*>/g, "")
}

/**
 * Extract initials from a name
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  if (!name) return ""

  const words = name.trim().split(/\s+/)
  const initials = words
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")

  return initials
}

/**
 * Generate a slug from string
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Check if string is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Escape HTML special characters
 */
export const escapeHtml = (str: string): string => {
  const div = document.createElement("div")
  div.textContent = str
  return div.innerHTML
}

/**
 * Unescape HTML special characters
 */
export const unescapeHtml = (str: string): string => {
  const div = document.createElement("div")
  div.innerHTML = str
  return div.textContent || div.innerText || ""
}

/**
 * Pluralize a word based on count
 */
export const pluralize = (word: string, count: number, plural?: string): string => {
  if (count === 1) return word
  return plural || word + "s"
}

/**
 * Generate random string
 */
export const randomString = (length: number = 8): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Convert bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

/**
 * Mask sensitive information (like phone numbers, credit cards)
 */
export const maskString = (str: string, visibleStart: number = 4, visibleEnd: number = 4, maskChar: string = "*"): string => {
  if (str.length <= visibleStart + visibleEnd) return str

  const start = str.substring(0, visibleStart)
  const end = str.substring(str.length - visibleEnd)
  const maskLength = str.length - visibleStart - visibleEnd
  const mask = maskChar.repeat(maskLength)

  return start + mask + end
}
