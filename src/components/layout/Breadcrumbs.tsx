import { useRouterState, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getApiProductDetailByIdOptions } from '@/shared/api/generated/@tanstack/react-query.gen'
import { useAuthStore } from '@/store/authStore'
import { ProductSwitcher } from './ProductSwitcher'
import { PRODUCT_TABS } from '@/components/features/products/detail/ProductDetailTabs'

/** Product section ids (2nd URL segment) + their labels. */
const PRODUCT_SECTIONS = new Set<string>(PRODUCT_TABS.map((t) => t.id))
const SECTION_LABEL: Record<string, string> = Object.fromEntries(
  PRODUCT_TABS.map((t) => [t.id, t.label]),
)
/** Static top-level portal segments — never treated as a product id. */
const STATIC_TOP = new Set<string>([
  'dashboard',
  'products',
  'contacts',
  'campaigns',
  'templates',
  'messages',
  'billing',
  'integrations',
  'files',
  'settings',
  'admin',
  'whatsapp',
])

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Produits',
  contacts: 'Contacts',
  campaigns: 'Campagnes',
  templates: 'Templates',
  messages: 'Messages',
  billing: 'Facturation',
  wallet: 'Wallet',
  transactions: 'Transactions',
  invoices: 'Factures',
  subscription: 'Abonnement',
  'payment-methods': 'Méthodes de paiement',
  integrations: 'Intégrations',
  connectors: 'Connecteurs',
  webhooks: 'Webhooks',
  'api-keys': 'API Keys',
  'sync-logs': 'Logs de sync',
  settings: 'Paramètres',
  company: 'Profil company',
  users: 'Utilisateurs',
  roles: 'Rôles',
  channels: 'Canaux',
  blocklist: 'Blocklist',
  tags: 'Tags',
  notifications: 'Notifications',
  new: 'Nouveau',
  edit: 'Modifier',
  segments: 'Segments',
  import: 'Import',
  imports: 'Historique imports',
  stats: 'Statistiques',
  steps: 'Étapes',
  errors: 'Erreurs',
  admin: 'Admin',
  companies: 'Companies',
  providers: 'Providers',
  pricing: 'Tarification',
  logs: 'Logs',
  audit: 'Audit',
  system: 'Système',
  failed: 'Échoués',
  jobs: 'Jobs',
}

const isId = (s: string) =>
  /^[0-9a-f-]{8,}$/i.test(s) || /^\d+$/.test(s)

export function Breadcrumbs() {
  const router = useRouterState()
  const pathname = router.location.pathname
  const segments = pathname.split('/').filter(Boolean)
  const companyName = useAuthStore((s) => s.user?.companyName)

  // Product context: /$productId/<section> (e.g. /<uuid>/contacts).
  const inProduct =
    segments.length >= 2 &&
    !STATIC_TOP.has(segments[0]) &&
    PRODUCT_SECTIONS.has(segments[1])
  const productId = inProduct ? segments[0] : undefined
  const section = inProduct ? segments[1] : undefined

  const productQuery = useQuery({
    ...getApiProductDetailByIdOptions({ path: { id: productId ?? '' } }),
    select: (res) => res?.data?.name ?? undefined,
    enabled: !!productId,
  })

  const link = 'text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] transition-colors cursor-pointer'
  const current = 'text-[12.5px] font-medium text-[#0D2137]'

  const items: { key: string; node: JSX.Element }[] = []
  // Home prefix — always present, returns to the dashboard.
  items.push({
    key: 'company',
    node: (
      <Link to="/dashboard" className={link}>
        {companyName || 'Accueil'}
      </Link>
    ),
  })

  if (inProduct) {
    // companyName / [Produit ⇅] / section
    items.push({
      key: 'product-switcher',
      node: (
        <ProductSwitcher
          activeProductId={productId}
          activeProductName={productQuery.data}
        />
      ),
    })
    items.push({
      key: 'section',
      node: (
        <span className={current}>{SECTION_LABEL[section!] ?? section}</span>
      ),
    })
  } else {
    // Generic path-driven crumbs (ids dropped).
    let builtPath = ''
    for (const seg of segments) {
      builtPath += `/${seg}`
      if (isId(seg)) continue
      const isCurrent = builtPath === pathname
      items.push({
        key: builtPath,
        node: isCurrent ? (
          <span className={current}>{routeLabels[seg] ?? seg}</span>
        ) : (
          <Link to={builtPath} className={link}>
            {routeLabels[seg] ?? seg}
          </Link>
        ),
      })
    }
  }

  if (items.length === 0) {
    return <span className={current}>Dashboard</span>
  }

  return (
    <nav className="flex items-center gap-1.5">
      {items.map((it, i) => (
        <span key={it.key} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[11px] text-[#B8CDD8]">/</span>}
          {it.node}
        </span>
      ))}
    </nav>
  )
}
