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
              <img src="/images/icon.png" alt="FujiPay logo" width={45} height={45} />
              <span className="text-xl font-semibold">FujiPay</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.developedBy")}</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.quickNav")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/">{t("navigation.home")}</Link>
              </li>
              <li>
                <Link to="/features">{t("navigation.features")}</Link>
              </li>
              <li>
                <Link to="/solutions">{t("navigation.solutions")}</Link>
              </li>
              <li>
                <Link to="/developers">{t("navigation.developers")}</Link>
              </li>
              <li>
                <Link to="/about">{t("navigation.about")}</Link>
              </li>
              <li>
                <Link to="/faq">{t("navigation.faq")}</Link>
              </li>
              <li>
                <Link to="/contact">{t("navigation.contact")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.services")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/features" hash="#payments">
                  {t("footer.mobilePayments")}
                </Link>
              </li>
              <li>
                <Link to="/features" hash="#withdrawals">
                  {t("footer.bankWithdrawals")}
                </Link>
              </li>
              <li>
                <Link to="/features" hash="#transfers">
                  {t("footer.moneyTransfers")}
                </Link>
              </li>
              <li>
                <Link to="/features" hash="#kyc">
                  {t("footer.kycManagement")}
                </Link>
              </li>
              <li>
                <Link to="/features" hash="#reporting">
                  {t("footer.financialReporting")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.contact")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>{t("footer.address")}</li>
              <li>contact@fujipay.com</li>
              <li>+237 123 456 789</li>
            </ul>
            <div className="mt-4 flex space-x-4">
              {/* <Link to="https://facebook.com" className="text-gray-400 hover:text-violet-500">
                <Facebook size={20} />
              </Link>
              <Link to="https://linkedin.com" className="text-gray-400 hover:text-violet-500">
                <Linkedin size={20} />
              </Link>
              <Link to="https://twitter.com" className="text-gray-400 hover:text-violet-500">
                <Twitter size={20} />
              </Link> */}
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/legal-notice">{t("footer.legalNotice")}</Link>
              </li>
              <li>
                <Link to="/terms">{t("footer.termsOfService")}</Link>
              </li>
              <li>
                <Link to="/privacy">{t("footer.privacyPolicy")}</Link>
              </li>
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
