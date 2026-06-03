# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

OmniChannel is a React + TypeScript SPA frontend for a multi-tenant messaging platform (SMS / Email / WhatsApp campaigns, contacts, billing, integrations). UI strings and many comments are in French. The repo is mid-refactor: a hand-rolled API layer is being replaced by a generated SDK, and a WhatsApp inbox feature was recently grafted in with its own conventions (see "Two API conventions" below).

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`), though scripts run plain `vite`/`tsc` so npm also works.

```bash
pnpm dev               # Vite dev server (--host, exposed on LAN)
pnpm build             # tsc -b && vite build  (type-checks then bundles)
pnpm lint              # eslint .
pnpm generate:api      # regenerate src/shared/api/generated/ from spec.yaml (hey-api)
pnpm generate:route    # regenerate src/router/routeTree.gen.ts (TanStack Router CLI)
```

There is **no test runner configured** — no `test` script, no vitest/jest. Don't assume tests exist.

To type-check without bundling, use `pnpm build` (there is no standalone `tsc` script; the project is `noEmit`).

## Architecture

Stack: React 18, TanStack Router (file-based), TanStack Query (server state), Zustand (client state), Tailwind v4, Zod (model validation), react-hook-form, i18next (`fr`), Axios. Path alias `@/` → `src/`.

### MVVM data flow (the core pattern)

The app follows a strict ViewModel pattern. **Pages are dumb; ViewModels hold all logic.**

1. **ViewModels** — `src/hooks/use*ViewModel.ts`. A ViewModel orchestrates queries + mutations + local UI state (filters, modals, pagination, active tab) and returns a flat object of data + handlers. Pages just consume it. See [useContactViewModel.ts](src/hooks/useContactViewModel.ts) for the full pattern (queries, mutations, `select`, error handling, handlers).
2. **Generated query helpers** — ViewModels call hey-api's generated TanStack Query helpers directly: `postApiClientSearchOptions({ body })`, `getApiProductDetailByIdOptions({ path })`, `postApiClientMutation()`, `postApiClientSearchQueryKey()`. Import from `@/shared/api/generated/@tanstack/react-query.gen`.
3. **Models / DTO mapping** — `src/models/*.model.ts`. Each model is a Zod schema extending `BaseModelSchema` plus a `mapToXModel(dto)` / `mapToXModels(dtos)` mapper. Mappers are the boundary that turns loose API DTOs into strict UI models: they parse via Zod with safe defaults, lowercase/normalize enums, and deserialize JSON-string fields (e.g. `clientAttributes`). Always map DTOs through these in a query's `select`, never consume raw `types.gen` DTOs in components. `safeParseWithDefault` in [base.model.ts](src/models/base.model.ts) is the safe-parse primitive.
4. **Error handling** — `useErrorHandling()` ([src/shared/hooks/useErrorHandling.ts](src/shared/hooks/useErrorHandling.ts)). Mutations use `onError: createMutationErrorHandler()` (or `createFormMutationErrorHandler(setError)` to map API validation errors onto react-hook-form fields). Queries call `handleRequestError(query.error)` inside a `useEffect` gated on `query.isError`.

### API layer

The OpenAPI contract lives in `spec.yaml`. `pnpm generate:api` (config in [openapi-ts.config.ts](openapi-ts.config.ts)) regenerates `src/shared/api/generated/` — `sdk.gen.ts`, `types.gen.ts`, `@tanstack/react-query.gen.ts`, `client.gen.ts`. **Never hand-edit `generated/`**; change `spec.yaml` and regenerate. A custom parser hook marks `POST .../search` endpoints as queries (so they get `...Options` query helpers, not mutations).

[src/shared/api/setup.ts](src/shared/api/setup.ts) configures the generated axios client (baseURL from `VITE_API_URL`, injects the Bearer token from `authStore`) and exports `handleRequest<T>()`, which normalizes any SDK call into `ApiResponse<T>` = `{ success: true, data }` | `FailedResponse`. The domain service wrappers in `src/shared/api/services/*.ts` (e.g. `ProductService`) wrap SDK calls in `handleRequest`.

**Two API conventions coexist (know which you're in):**
- **Main app** (products, contacts, campaigns, templates, billing, settings, admin) — generated SDK + generated TanStack Query helpers + Zod model mappers, as above.
- **WhatsApp inbox** — does NOT use the generated SDK. It has its own hand-written axios client + service ([src/shared/api/services/whatsapp.ts](src/shared/api/services/whatsapp.ts)) with a **hardcoded `BASE_URL`** (`https://api.omnichannel.nguetioofa.dev`, separate from `VITE_API_URL`), its own store ([useWhatsappStore.ts](src/store/useWhatsappStore.ts)), React Query hooks ([useWhatsapp.ts](src/hooks/useWhatsapp.ts)), models ([whatsapp.models.ts](src/models/whatsapp.models.ts)), and real-time updates over SignalR ([useSignalR.ts](src/hooks/useSignalR.ts), hub at `/hubs/conversations`).

A legacy hand-rolled `src/shared/api/client.ts` also exists but is superseded by `setup.ts` + generated client.

### Routing

File-based via TanStack Router. **Routes live in `src/router/routes/`** (not the default `src/routes/`; configured in [tsr.config.json](tsr.config.json)), and the tree is generated into `src/router/routeTree.gen.ts` (auto-regenerated by the Vite plugin in dev, or via `pnpm generate:route`).

Route files are intentionally thin wrappers: each `createFileRoute` points `component` at a page from `src/pages/...` and adds a `beforeLoad` permission guard. Example:

```tsx
export const Route = createFileRoute("/_portal/products/")({
  component: ProductsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ, redirectTo: "/forbidden",
    });
  },
});
```

The actual page implementations live in `src/pages/` mirroring the route layout: `_portal/` (client app, wrapped by Sidebar+Header in [_portal.tsx](src/router/routes/_portal.tsx)), `admin/` (backoffice), `auth/`, `whatsapp/`. The router context (`{ user, strategy }`) is defined in [routerContext.ts](src/router/routerContext.ts) and supplied from [main.tsx](src/main.tsx).

### Security / permissions

`src/security/` is a strategy-pattern authorization layer:
- `ACTION` enum in [enums.ts](src/security/enums.ts) is the canonical permission catalog (`RESOURCE_VERB`, e.g. `PRODUCT_READ`). Add new permissions here.
- `IPermissionStrategy` implementations: `ABACStrategy` (wired in `main.tsx` with `rules`), `RBACStrategy`, `TenantStrategy`.
- Route gating: `requirePermission(user, strategy, { action, redirectTo })` in `beforeLoad`.
- In-component gating: `<Can perform={ACTION.X} fallback={...}>`, `SecureButton`, `SecuredField`, and the `useSecurity()` hook (`can` / `canAny` / `canAll`).

**Important — auth is currently stubbed off.** `ABACStrategy.can` and `RBACStrategy.can` early-`return true`, `main.tsx` passes an empty user `{}`, and the `_portal` auth redirect is commented out. Permission checks therefore pass unconditionally in the current state. Wire real logic into the strategy `can()` methods (and uncomment the redirects) when implementing access control — don't assume guards are enforcing anything today.

### State

Zustand stores in `src/store/` (`authStore` — persisted under key `oc-auth`, holds `token`/`user`; plus `uiStore`, `notificationStore`, `errorStore`, `campaignDraftStore`, `useWhatsappStore`). TanStack Query (`queryClient` in [queryClient.ts](src/shared/api/queryClient.ts): 2-min staleTime, retry 1, no refetch-on-focus) owns all server state.

### Components & i18n

- `src/components/ui/` — custom design-system primitives (Badge, Button, Modal, Select…).
- `src/components/ui/shadcn/` — shadcn/ui components (added with WhatsApp; `components.json` at root). Two UI kits coexist — match whichever the surrounding feature already uses.
- `src/components/features/<domain>/` — composite feature components; plus `layout/`, `feedback/`, `charts/`, `data-table/`.
- i18n: i18next, locale `fr` (default + fallback). App namespaces load from `src/i18n/locales/fr/*.json` ([index.ts](src/i18n/index.ts)). Note `public/locales/{en,fr}/translation.json` also exist for the i18next-parser but aren't loaded at runtime.

## Conventions

- New backend interactions in the main app go through the generated SDK + a Zod model mapper, surfaced via a `use*ViewModel` hook — not ad-hoc axios calls. The WhatsApp feature is the one deliberate exception.
- Toasts use `sonner` (`toast.success` / `toast.error`), already mounted in `main.tsx`.
- The top-level `whatsapp/` directory is a reference README/scaffold, not built source — the live code is under `src/`.
