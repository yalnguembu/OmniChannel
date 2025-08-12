import { useState } from "react"
import { Link } from "@tanstack/react-router"
// import { usePathname } from 'next/navigation'
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeModeToggle } from "./ThemeModeToggle"
import LanguageToggle from "./LanguageToggle"

export default function Navbar() {
  const { t } = useTranslation()
  const pathname = "index" //usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const publicNavItems = [
    { href: "/features", label: t("navigation.features") },
    { href: "/solutions", label: t("navigation.solutions") },
    { href: "/developers", label: t("navigation.developers") },
    { href: "/about", label: t("navigation.about") },
    { href: "/faq", label: t("navigation.faq") },
    { href: "/contact", label: t("navigation.contact") },
  ]

  const unauthenticatedNavItems = [
    {
      href: "/auth/login",
      label: t("navigation.login"),
      isButton: true,
      variant: "outline" as const,
      extraClass: "border-primary text-primary font-medium",
    },
    {
      href: "/contact",
      label: t("navigation.requestDemo"),
      isButton: true,
      variant: "default" as const,
      extraClass: "text-white bg-primary hover:shadow-lg hover:text-white",
    },
  ]

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/icon.png" alt="FujiPay logo" width={45} height={45} />
            <span className="text-xl font-medium">FujiPay</span>
          </Link>
          <nav className="hidden items-center space-x-6 lg:flex">
            {publicNavItems.map((item) => (
              <Link key={item.label} to={item.href} className={`${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "font-semibold text-primary" : ""}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-x-4">
          <LanguageToggle />
          <ThemeModeToggle size="icon" />

          <div className="hidden items-center space-x-4 lg:flex">
            {unauthenticatedNavItems.map((item) =>
              item.isButton ? (
                <Link key={item.label} to={item.href}>
                  <Button variant={item.variant} className={item.extraClass || ""}>
                    {item.label}
                  </Button>
                </Link>
              ) : (
                <Link key={item.label} to={item.href} className={`hover:text-secondary ${pathname === item.href ? "font-semibold text-secondary" : ""}`}>
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-50 bg-background p-4 shadow-lg lg:hidden">
          <nav className="flex flex-col space-y-4">
            {publicNavItems.map((item) => (
              <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)} className={`${pathname === item.href ? "font-semibold text-primary" : ""}`}>
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4">
              {unauthenticatedNavItems.map((item) => (
                <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={item.variant} className={`w-full ${item.extraClass || ""}`}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
