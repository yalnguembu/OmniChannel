import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import i18n from "@/shared/i18n"
import type { MenuNode, UIStore } from "@/shared/types/ui"

function setNestedValue(obj: MenuNode, path: string[], data: Record<string, any>) {
  const key = path[0]
  if (path.length === 1) {
    obj[key] = { ...((obj[key] as Record<string, any>) || {}), ...data }
  } else {
    if (!obj[key] || typeof obj[key] !== "object") obj[key] = {}
    setNestedValue(obj[key] as MenuNode, path.slice(1), data)
  }
}

function getNestedValue(obj: MenuNode, path: string[]): any {
  return path.reduce((acc, key) => acc && acc[key], obj)
}

const getSystemTheme = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export const useUIStore = create<UIStore>()(
  persist(
    devtools(
      (set, get) => ({
        theme: "light",
        sidebarOpen: true,
        modalOpen: false,
        themeMode: "system",
        isDarkMode: getSystemTheme(),

        language: localStorage.getItem("lang") || "fr",

        isLoading: false,

        menuState: {},
        context: "CONFIGURATION",

        setContext: (context) => set({ context }, false, "ui/setContext"),

        setThemeMode: (mode) => {
          let isDarkMode

          if (mode === "system") {
            isDarkMode = getSystemTheme()
          } else {
            isDarkMode = mode === "dark"
          }

          document.documentElement.classList.toggle("dark", isDarkMode)
          set({ themeMode: mode, isDarkMode }, false, "ui/setThemeMode")
        },

        toggleTheme: () => {
          const { themeMode, isDarkMode } = get()
          const newMode = themeMode === "system" ? (isDarkMode ? "light" : "dark") : themeMode === "dark" ? "light" : "dark"

          get().setThemeMode(newMode)
        },

        setLanguage: (lang) => {
          localStorage.setItem("lang", lang)
          i18n.changeLanguage(lang)
          set({ language: lang }, false, "ui/setLanguage")
        },

        setIsLoading: (loading) => set({ isLoading: loading }, false, "ui/setIsLoading"),

        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, "ui/toggleSidebar"),

        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, "ui/setSidebarOpen"),

        setModalOpen: (open) => set({ modalOpen: open }, false, "ui/setModalOpen"),

        updateMenuProperty: (pathString, data) => {
          const path = pathString.split(".")
          set(
            (state) => {
              const updated = { ...state.menuState }
              setNestedValue(updated, path, data)
              return { menuState: updated }
            },
            false,
            "ui/updateMenuProperty",
          )
        },
        getMenuProperty: (pathString) => {
          const path = pathString.split(".")
          return getNestedValue(get().menuState, path)
        },
      }),
      { name: "ui-store" },
    ),
    {
      name: "ui-storage",
      partialize: (state) => ({
        themeMode: state.themeMode,
        isDarkMode: state.isDarkMode,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
        menuState: state.menuState,
        context: state.context,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const isDarkMode = state.themeMode === "system" ? getSystemTheme() : state.themeMode === "dark"
        document.documentElement.classList.toggle("dark", isDarkMode)
        if (state.isDarkMode !== isDarkMode) {
          state.isDarkMode = isDarkMode
        }
        if (state.language) {
          i18n.changeLanguage(state.language)
        }
      },
    },
  ),
)

/**
 * 🧠 Combined UI Store (Zustand)
 * -----------------------------------
 * This store centralizes all UI-related state management:
 *
 * Features:
 *
 * 🎨 Theme Management:
 * - themeMode: 'light' | 'dark' | 'system'
 * - isDarkMode: boolean
 * - setThemeMode(mode): Changes the theme
 * - toggleTheme(): Switches between light/dark mode
 *
 * 🌐 Language Management:
 * - language: Current language code
 * - setLanguage(lang): Changes the application language
 *
 * ⏳ Loading States:
 * - isLoading: Global loading state
 * - setIsLoading(loading): Update loading state
 *
 * 📐 UI Layout Controls:
 * - sidebarOpen: Controls sidebar visibility
 * - modalOpen: Controls modal visibility
 * - toggleSidebar(): Toggle sidebar state
 * - setSidebarOpen(open): Set sidebar state directly
 * - setModalOpen(open): Control modal state
 *
 * 📊 Menu State Management:
 * - menuState: Nested object for storing menu-related state
 * - updateMenuProperty(path, data): Update state at a specific path
 * - getMenuProperty(path): Get state from a specific path
 *
 * The store uses:
 * - persist: Saves theme and language preferences to localStorage
 * - devtools: Provides Redux DevTools integration for debugging
 */
