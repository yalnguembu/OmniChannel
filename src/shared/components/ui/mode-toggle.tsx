import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { useUIStore } from "@/shared/stores/uiStore"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

type ThemeMode = "light" | "dark" | "system"
type ToggleMode = "dropdown" | "switch"

export function ModeToggle({ className = "", mode: toggleMode = "dropdown" }: { className?: string; mode?: ToggleMode }) {
  const { themeMode: mode, isDarkMode, setThemeMode: setMode, setIsLoading } = useUIStore()
  const { t } = useTranslation()

  // Écoute les changements du thème système si mode = system
  useEffect(() => {
    if (mode !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      setIsLoading(true)
      document.documentElement.classList.toggle("dark", e.matches)
      setTimeout(() => setIsLoading(false), 300)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [mode, setIsLoading])

  const handleSetTheme = (newMode: ThemeMode) => {
    setIsLoading(true)
    setMode(newMode)
    setTimeout(() => setIsLoading(false), 800)
  }

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(mode)
    const nextIndex = (currentIndex + 1) % themes.length
    handleSetTheme(themes[nextIndex])
  }

  if (toggleMode === "switch") {
    return (
      <Button variant="outline" size="icon" className={`shadow-sm ${className}`} onClick={cycleTheme}>
        {mode === "system" ? <Monitor className="h-4 w-4" /> : isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <div className={`z-10 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shadow-sm">
            {mode === "system" ? <Monitor className="h-4 w-4" /> : isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-xs flex items-center gap-2" onClick={() => handleSetTheme("light")} data-active={mode === "light"}>
            <Sun className="h-3 w-3" />
            {t("themeMode.light")}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs flex items-center gap-2" onClick={() => handleSetTheme("dark")} data-active={mode === "dark"}>
            <Moon className="h-3 w-3" />
            {t("themeMode.dark")}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs flex items-center gap-2" onClick={() => handleSetTheme("system")} data-active={mode === "system"}>
            <Monitor className="h-3 w-3" />
            {t("themeMode.system")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
