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
      variant: "default" as const,
      extraClass: "",
    },
    // {
    //   href: "/contact",
    //   label: t("navigation.requestDemo"),
    //   isButton: true,
    //   variant: "default" as const,
    //   extraClass: "text-white bg-primary hover:shadow-lg hover:text-white",
    // },
  ]

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-x-8 lg:w-full">
          <Link to="/" className="flex items-center gap-x-2">
            <img src="/images/icon.png" alt="FujiPay logo" className="size-12" />
            <span className="text-lg lg:text-3xl font-black lg:hidden xl:inline">
              <span className="text-accent">FUJISAT</span>
              <span className="text-primary pl-1">Pay</span>
            </span>
          </Link>
          <nav className="hidden items-center lg:w-full lg:justify-center font-normal text-muted-foreground/80 gap-x-3 lg:gap-x-6 xl:gap-x-8 lg:flex">
            {publicNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`lg:text-xs xl:text-sm hover:text-primary ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "font-semibold text-primary" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-x-4">
          <LanguageToggle />
          <ThemeModeToggle size="icon" />

          <div className="hidden items-center space-x-4 lg:flex lg:border-l lg:pl-4 xl:pl-6">
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
          <nav className="flex flex-col gap-y-4">
            {publicNavItems.map((item) => (
              <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)} className={`${pathname === item.href ? "font-semibold text-primary" : ""}`}>
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-y-2 pt-4">
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
