import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr_common from './locales/fr/common.json'
import fr_campaigns from './locales/fr/campaigns.json'
import fr_contacts from './locales/fr/contacts.json'
import fr_billing from './locales/fr/billing.json'

i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  resources: {
    fr: {
      common: fr_common,
      campaigns: fr_campaigns,
      contacts: fr_contacts,
      billing: fr_billing,
    },
  },
  interpolation: { escapeValue: false },
})

export default i18n
