import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useUIStore } from "@/shared/stores"
import { ThemeMode } from "@/shared/types/ui"

type ToggleMode = "dropdown" | "switch"

type ThemeModeToggleProps = {
  className?: string
  themeMode?: ToggleMode
  size?: "default" | "icon"
}

export function ThemeModeToggle({ className = "", themeMode: toggleMode = "dropdown", size = "icon" }: ThemeModeToggleProps) {
  const { themeMode, isDarkMode, setThemeMode, setIsLoading } = useUIStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (themeMode !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)")
    const handler = (e: MediaQueryListEvent) => {
      setIsLoading(true)
      document.documentElement.classList.toggle("dark", e.matches)
      setTimeout(() => setIsLoading(false), 300)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [themeMode, setIsLoading])

  const handleSetTheme = (newMode: ThemeMode) => {
    setIsLoading(true)
    setThemeMode(newMode)
    setTimeout(() => setIsLoading(false), 800)
  }

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(themeMode)
    const nextIndex = (currentIndex + 1) % themes.length
    handleSetTheme(themes[nextIndex])
  }

  if (toggleMode === "switch") {
    return (
      <Button variant="outline" size="icon" className={`shadow-sm ${className}`} onClick={cycleTheme}>
        {themeMode === "system" ? <Monitor className="h-4 w-4" /> : isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className={size === "icon" ? "sr-only" : ""}>Toggle theme</span>
      </Button>
    )
  }

  return (
    <div className={`z-10 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full justify-start px-2">
          <Button variant={size === "icon" ? "outline" : "ghost"} size="icon" className={size === "icon" ? "shadow-sm" : ""}>
            {themeMode === "system" ? <Monitor className="h-4 w-4" /> : isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className={size === "icon" ? "sr-only" : ""}>Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-xs flex items-center gap-2" onClick={() => handleSetTheme("light")} data-active={themeMode === "light"}>
            <Sun className="h-3 w-3" />
            {t("themeMode.light")}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs flex items-center gap-2" onClick={() => handleSetTheme("dark")} data-active={themeMode === "dark"}>
            <Moon className="h-3 w-3" />
            {t("themeMode.dark")}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs flex items-center gap-2" onClick={() => handleSetTheme("system")} data-active={themeMode === "system"}>
            <Monitor className="h-3 w-3" />
            {t("themeMode.system")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
