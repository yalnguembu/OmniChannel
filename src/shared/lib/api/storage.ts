import { encodeToBinary, decodeFromBinary } from "../encoding"

export interface IStorageService {
  setLocaleItem<T>(key: string, value: T): void
  getLocaleItem<T>(key: string): T | null
  setCookieItem<T>(key: string, value: T): void
  getCookieItem<T>(key: string): T | null
  removeLocaleItem(key: string): void
  clearLocale(): void
  setSessionItem<T>(key: string, value: T): void
  getSessionItem<T>(key: string): T | null
  removeSessionItem(key: string): void
  clearSession(): void
  isCacheValid(timestamp: number, maxAgeMs?: number): boolean
  getAllKeys(): Promise<readonly string[]>
  getStorageInfo(): Promise<{ keys: readonly string[]; size: number }>
}

class StorageService implements IStorageService {
  setLocaleItem<T>(key: string, value: T): void {
    try {
      const jsonValue = JSON.stringify(value)
      localStorage.setItem(key, jsonValue)
    } catch (error) {
      console.error(`Error storing ${key}:`, error)
      throw error
    }
  }

  getLocaleItem<T>(key: string): T | null {
    try {
      const jsonValue = localStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error)
      return null
    }
  }

  setCookieItem<T>(key: string, value: T): void {
    try {
      const jsonValue = JSON.stringify(value)
      const binaryValue = encodeToBinary(jsonValue)
      document.cookie = `${key}=${binaryValue}; path=/`
    } catch (error) {
      console.error(`Error storing ${key}:`, error)
      throw error
    }
  }

  getCookieItem<T>(key: string): T | null {
    try {
      const cookies = document.cookie.split("; ")
      const cookie = cookies.find((c) => c.startsWith(`${key}=`))
      const binaryValue = cookie ? cookie.split("=")[1] : null
      const jsonValue = binaryValue ? decodeFromBinary(binaryValue) : null
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error)
      return null
    }
  }

  removeLocaleItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key}:`, error)
      throw error
    }
  }

  clearLocale(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing storage:", error)
      throw error
    }
  }

  setSessionItem<T>(key: string, value: T): void {
    try {
      const jsonValue = JSON.stringify(value)
      sessionStorage.setItem(key, jsonValue)
    } catch (error) {
      console.error(`Error storing ${key}:`, error)
      throw error
    }
  }

  getSessionItem<T>(key: string): T | null {
    try {
      const jsonValue = sessionStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error)
      return null
    }
  }

  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key}:`, error)
      throw error
    }
  }

  clearSession(): void {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error("Error clearing storage:", error)
      throw error
    }
  }

  isCacheValid(timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
    return Date.now() - timestamp < maxAgeMs
  }

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await localStorage.getAllKeys()
    } catch (error) {
      console.error("Error getting all keys:", error)
      return []
    }
  }

  async getStorageInfo(): Promise<{ keys: readonly string[]; size: number }> {
    try {
      const keys = await this.getAllKeys()
      let totalSize = 0

      for (const key of keys) {
        const value = await localStorage.getItem(key)
        if (value) {
          totalSize += value.length
        }
      }

      return { keys, size: totalSize }
    } catch (error) {
      console.error("Error getting storage info:", error)
      return { keys: [], size: 0 }
    }
  }
}

export const storageService = new StorageService()
