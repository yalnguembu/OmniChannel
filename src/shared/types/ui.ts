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
  pageTitle: string
}

export type ThemeMode = "light" | "dark" | "system"

export type MenuNode = {
  [key: string]: MenuNode | Record<string, any>
}

interface UIActions {
  setContext: (context: CONTEXT) => void
  setThemeMode: (mode: ThemeMode) => void
  setLanguage: (lang: string) => void
  setPageTitle: (lang: string) => void
  setIsLoading: (loading: boolean) => void
  setSidebarOpen: (open: boolean) => void
  updateMenuProperty: (path: string, data: Record<string, any>) => void
  getMenuProperty: (path: string) => Record<string, any> | undefined
  toggleTheme: () => void
  toggleSidebar: () => void
  setModalOpen: (open: boolean) => void
}

export type UIStore = UIState & UIActions
