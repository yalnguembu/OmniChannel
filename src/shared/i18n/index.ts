import i18n from "i18next"
import { initReactI18next } from "react-i18next"
// import { resources } from "./resources"
import Backend from "i18next-http-backend"
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector"

i18n
  .use(Backend)
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    // resources,
    // lng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    fallbackNS: "translation",
    fallbackLng: "fr",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    // react: {
    //   useSuspense: false,
    // },
  })

export default i18n
