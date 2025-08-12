export type CONTEXT = "SYSTEM" | "COMAPNY"

interface UIState {
  themeMode: ThemeMode
  isDarkMode: boolean
  language: string
  isLoading: boolean
  sidebarOpen: boolean
  modalOpen: boolean
  menuState: MenuNode
  context: CONTEXT
  setContext: (context: CONTEXT) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  setLanguage: (lang: string) => void
  setIsLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setModalOpen: (open: boolean) => void
  updateMenuProperty: (path: string, data: Record<string, any>) => void
  getMenuProperty: (path: string) => Record<string, any> | undefined
}

export type ThemeMode = "light" | "dark" | "system"

export type MenuNode = {
  [key: string]: MenuNode | Record<string, any>
}

interface UIActions {
  toggleTheme: () => void
  toggleSidebar: () => void
  setModalOpen: (open: boolean) => void
}

export type UIStore = UIState & UIActions
