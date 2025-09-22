import "i18next"
import translation from "./translation"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: typeof translation
    }
  }
}
