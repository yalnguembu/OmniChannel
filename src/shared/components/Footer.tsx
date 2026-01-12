import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
// import { Facebook, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <img src="/images/icon.png" alt="Template Web logo" width={45} height={45} />
              <span className="text-xl font-semibold">Template Web</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.developedBy")}</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.quickNav")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/">{t("navigation.home")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.services")}</h4>
            <ul className="space-y-2 text-muted-foreground">

            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.contact")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>{t("footer.address")}</li>
              <li>contact@templateweb.com</li>
              <li>+237 123 456 789</li>
            </ul>
            <div className="mt-4 flex space-x-4">

            </div>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-muted-foreground">

            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}
