import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useUIStore } from "../stores"

export default function LanguageToggle() {
  const { language, setLanguage } = useUIStore()

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="flex items-center space-x-1 px-2">
          <Button variant="ghost">
            <Globe className="h-4 w-4" />
            <span className="uppercase">Lang ({language})</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom">
          <DropdownMenuItem onClick={() => setLanguage("en")}>
            <span className={language === "en" ? "font-semibold text-secondary" : ""}>English</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLanguage("fr")}>
            <span className={language === "fr" ? "font-semibold text-secondary" : ""}>Français</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
