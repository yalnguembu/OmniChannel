# OmniChannel — Frontend

Interface client React + TypeScript pour la plateforme OmniChannel.

## Stack

- **React 18** + **TypeScript**
- **TanStack Router** (file-based routing)
- **TanStack Query** (server state)
- **Zustand** (client state)
- **Tailwind CSS v4** (styles)
- **Framer Motion** (animations)
- **React Hook Form** + **Zod** (formulaires)
- **Sonner** (toasts)
- **Axios** (HTTP)

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer VITE_API_URL avec l'URL de votre API

# 3. Lancer en développement
npm run dev

# 4. Build production
npm run build
```

## Structure

```
src/
├── api/              # Client HTTP, services générés, hooks React Query
├── components/       # Composants UI réutilisables
│   ├── ui/           # Badge, Button, Input, Modal, Toggle, ...
│   ├── layout/       # Sidebar, Header, Breadcrumbs
│   ├── feedback/     # EmptyState, PageLoader, KPICard
│   ├── data-table/   # DataTable + Pagination
│   └── charts/       # DeliveryRateChart, WalletBalanceChart, ...
├── lib/              # Utils, date, currency, validators (Zod), animations
├── routes/           # Pages (TanStack Router file-based)
│   ├── _portal/      # Espace client (dashboard, produits, contacts, ...)
│   └── _admin/       # Backoffice admin
├── store/            # Zustand stores (auth, ui, notifications, campaigns)
├── i18n/             # Internationalisation (fr)
└── types/            # Types TypeScript globaux
```

## Portail client (`/`)

| Route | Page |
|-------|------|
| `/dashboard` | KPIs globaux |
| `/products` | Gestion des produits |
| `/contacts` | Contacts + segments + import |
| `/campaigns` | Campagnes + wizard 5 étapes |
| `/templates` | Éditeur de templates |
| `/messages` | Historique messages |
| `/billing/*` | Wallet, factures, abonnement |
| `/integrations/*` | Connecteurs, webhooks, API keys |
| `/settings/*` | Company, utilisateurs, rôles, canaux, blocklist, tags |

## Backoffice admin (`/admin`)

| Route | Page |
|-------|------|
| `/admin` | Dashboard global |
| `/admin/companies` | Toutes les companies |
| `/admin/providers` | Providers SMS/Email/WhatsApp |
| `/admin/pricing` | Grille tarifaire |
| `/admin/messages` | Messages cross-companies |
| `/admin/channels` | Canaux plateforme |
| `/admin/logs/audit` | Audit log |
| `/admin/logs/system` | Logs système |
| `/admin/settings` | Paramètres système |
