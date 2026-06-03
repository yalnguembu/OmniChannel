import { useRouterState, Link } from '@tanstack/react-router'

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

export function Breadcrumbs() {
  const router = useRouterState()
  const pathname = router.location.pathname
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return <span className="text-[12.5px] font-medium text-[#0D2137]">Dashboard</span>
  }

  const isId = (s: string) =>
    /^[0-9a-f-]{8,}$/i.test(s) || /^\d+$/.test(s)

  const crumbs: { label: string; path: string }[] = []
  let builtPath = ''

  for (const seg of segments) {
    builtPath += `/${seg}`
    if (isId(seg)) continue
    crumbs.push({ label: routeLabels[seg] ?? seg, path: builtPath })
  }

  if (crumbs.length === 1) {
    return <span className="text-[12.5px] font-medium text-[#0D2137]">{crumbs[0].label}</span>
  }

  return (
    <nav className="flex items-center gap-1.5">
      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[11px] text-[#B8CDD8]">/</span>}
          {i < crumbs.length - 1 ? (
            <Link
              to={c.path}
              className="text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] transition-colors cursor-pointer"
            >
              {c.label}
            </Link>
          ) : (
            <span className="text-[12.5px] font-medium text-[#0D2137]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
