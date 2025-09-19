import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useUIStore } from "../stores"

export default function LanguageToggle({ variant = "default", direction = "bottom" }: { variant?: "default" | "expanded"; direction?: "left" | "bottom" | "top" | "right" }) {
  const { language, setLanguage } = useUIStore()

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`flex items-center space-x-0.5 ${variant === "expanded" ? "w-full justify-start" : ""}`}>
            <Globe className="h-4 w-4" />
            {variant === "expanded" && "Language"}
            <span className="uppercase">{language}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side={direction}>
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
