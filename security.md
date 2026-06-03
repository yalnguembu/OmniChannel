# Sécurité composant en React — TypeScript + TanStack Router

## Architecture

```
SecurityProvider (injecte la stratégie)
├── useSecurity()         → hook consommateur typé
├── createAuthRoute()     → garde de route TanStack
├── <Can>                 → affichage conditionnel
├── <SecureButton>        → contrôle au niveau action
└── <SecureField>         → contrôle au niveau champ

PermissionStrategy (interface générique)
├── RBACStrategy          → rôle → liste de permissions
├── ABACStrategy          → règles basées sur attributs
└── TenantStrategy        → surcharges par tenant
```

---

## 1. Types & Interface de stratégie

```ts
// security/types.ts
export type Action =
  | 'read'
  | 'write'
  | 'delete'
  | 'manage_users';

export type Role = 'admin' | 'editor' | 'viewer';

export interface UserSession {
  id: string;
  role: Role;
  tenantId?: string;
  attributes?: Record<string, unknown>;
}

export interface IPermissionStrategy {
  can(user: UserSession | null, action: Action, resource?: unknown): boolean;
  canAny(user: UserSession | null, actions: Action[]): boolean;
  canAll(user: UserSession | null, actions: Action[]): boolean;
}

export interface SecurityContextValue {
  can(action: Action, resource?: unknown): boolean;
  canAny(actions: Action[]): boolean;
  canAll(actions: Action[]): boolean;
  user: UserSession | null;
}
```

---

## 2. Stratégies concrètes

### RBAC

```ts
// security/strategies/RBACStrategy.ts
import type { Action, UserSession, IPermissionStrategy, Role } from '../types';

type RoleMap = Record<Role, Action[]>;

export class RBACStrategy implements IPermissionStrategy {
  constructor(private readonly roleMap: RoleMap) {}

  can(user: UserSession | null, action: Action): boolean {
    if (!user) return false;
    return this.roleMap[user.role]?.includes(action) ?? false;
  }

  canAny(user: UserSession | null, actions: Action[]): boolean {
    return actions.some(a => this.can(user, a));
  }

  canAll(user: UserSession | null, actions: Action[]): boolean {
    return actions.every(a => this.can(user, a));
  }
}
```

### ABAC

```ts
// security/strategies/ABACStrategy.ts
import type { Action, UserSession, IPermissionStrategy } from '../types';

interface Rule {
  action: Action;
  condition: (user: UserSession, resource?: unknown) => boolean;
}

export class ABACStrategy implements IPermissionStrategy {
  constructor(private readonly rules: Rule[]) {}

  can(user: UserSession | null, action: Action, resource?: unknown): boolean {
    if (!user) return false;
    const rule = this.rules.find(r => r.action === action);
    return rule ? rule.condition(user, resource) : false;
  }

  canAny(user: UserSession | null, actions: Action[]): boolean {
    return actions.some(a => this.can(user, a));
  }

  canAll(user: UserSession | null, actions: Action[]): boolean {
    return actions.every(a => this.can(user, a));
  }
}
```

### Multi-tenant

```ts
// security/strategies/TenantStrategy.ts
import type { Action, UserSession, IPermissionStrategy } from '../types';

export class TenantStrategy implements IPermissionStrategy {
  constructor(
    private readonly base: IPermissionStrategy,
    private readonly overrides: Record<string, IPermissionStrategy>,
  ) {}

  can(user: UserSession | null, action: Action, resource?: unknown): boolean {
    if (!user) return false;
    const strategy = user.tenantId ? this.overrides[user.tenantId] : undefined;
    return (strategy ?? this.base).can(user, action, resource);
  }

  canAny(user: UserSession | null, actions: Action[]): boolean {
    return actions.some(a => this.can(user, a));
  }

  canAll(user: UserSession | null, actions: Action[]): boolean {
    return actions.every(a => this.can(user, a));
  }
}
```

---

## 3. SecurityProvider

```tsx
// security/SecurityProvider.tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Action, UserSession, IPermissionStrategy, SecurityContextValue } from './types';

const SecurityContext = createContext<SecurityContextValue | null>(null);

interface SecurityProviderProps {
  strategy: IPermissionStrategy;
  user: UserSession | null;
  children: ReactNode;
}

export const SecurityProvider = ({ strategy, user, children }: SecurityProviderProps) => {
  const value = useMemo<SecurityContextValue>(() => ({
    can:    (action, resource) => strategy.can(user, action, resource),
    canAny: (actions)          => strategy.canAny(user, actions),
    canAll: (actions)          => strategy.canAll(user, actions),
    user,
  }), [strategy, user]);

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextValue => {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
  return ctx;
};
```

---

## 4. Garde de route — TanStack Router

TanStack Router n'a pas de composant `<PrivateRoute>` : les gardes s'appliquent via `beforeLoad` dans la définition de la route.

### Contexte de routeur typé

```ts
// router/routerContext.ts
import type { IPermissionStrategy, UserSession } from '../security/types';

export interface RouterContext {
  user: UserSession | null;
  strategy: IPermissionStrategy;
}
```

### Utilitaire de garde

```ts
// security/guards.ts
import { redirect } from '@tanstack/react-router';
import type { Action, UserSession, IPermissionStrategy } from './types';

interface GuardOptions {
  action: Action;
  resource?: unknown;
  redirectTo?: string;
}

export function requirePermission(
  user: UserSession | null,
  strategy: IPermissionStrategy,
  { action, resource, redirectTo = '/403' }: GuardOptions,
) {
  if (!strategy.can(user, action, resource)) {
    throw redirect({ to: redirectTo });
  }
}
```

### Définition des routes

```ts
// router/routes.ts
import { createRootRouteWithContext, createRoute } from '@tanstack/react-router';
import { requirePermission } from '../security/guards';
import type { RouterContext } from './routerContext';
import { RootLayout } from '../layouts/RootLayout';
import { Dashboard } from '../pages/Dashboard';
import { AdminPanel } from '../pages/AdminPanel';
import { Forbidden } from '../pages/Forbidden';

// Route racine avec contexte typé
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, { action: 'read' });
  },
  component: Dashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: 'manage_users',
      redirectTo: '/403',
    });
  },
  component: AdminPanel,
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/403',
  component: Forbidden,
});

export const routeTree = rootRoute.addChildren([
  dashboardRoute,
  adminRoute,
  forbiddenRoute,
]);
```

### Création du routeur avec contexte

```ts
// router/index.ts
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routes';
import type { RouterContext } from './routerContext';

export const router = createRouter({
  routeTree,
  context: {} as RouterContext, // fourni au rendu
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

---

## 5. Composants de sécurité typés

### `<Can>`

```tsx
// security/Can.tsx
import type { ReactNode } from 'react';
import type { Action } from './types';
import { useSecurity } from './SecurityProvider';

interface CanProps {
  perform: Action;
  resource?: unknown;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ perform, resource, children, fallback = null }: CanProps) => {
  const { can } = useSecurity();
  return <>{can(perform, resource) ? children : fallback}</>;
};
```

### `<SecureButton>`

```tsx
// security/SecureButton.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Action } from './types';
import { useSecurity } from './SecurityProvider';

interface SecureButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  perform: Action;
  resource?: unknown;
  hide?: boolean;
  children: ReactNode;
}

export const SecureButton = ({
  perform,
  resource,
  hide = false,
  children,
  ...props
}: SecureButtonProps) => {
  const { can } = useSecurity();

  if (!can(perform, resource)) {
    return hide ? null : (
      <button disabled title="Permissions insuffisantes" {...props}>
        {children}
      </button>
    );
  }

  return <button {...props}>{children}</button>;
};
```

### `<SecureField>`

```tsx
// security/SecureField.tsx
import type { ChangeEvent } from 'react';
import type { Action } from './types';
import { useSecurity } from './SecurityProvider';

interface SecureFieldProps {
  perform: Action;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const SecureField = ({ perform, label, value, onChange }: SecureFieldProps) => {
  const { can } = useSecurity();
  return (
    <div>
      <label>{label}</label>
      {can(perform) ? (
        <input value={value} onChange={onChange} />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
};
```

---

## 6. Câblage à la racine

```tsx
// app/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { SecurityProvider } from './security/SecurityProvider';
import { RBACStrategy } from './security/strategies/RBACStrategy';
import { router } from './router';
import { useCurrentUser } from './hooks/useCurrentUser';

const roleMap = {
  admin:  ['read', 'write', 'delete', 'manage_users'],
  editor: ['read', 'write'],
  viewer: ['read'],
} as const;

const strategy = new RBACStrategy(roleMap);
// → remplacer par TenantStrategy ou ABACStrategy sans toucher aux composants

function Root() {
  const user = useCurrentUser();

  return (
    <SecurityProvider strategy={strategy} user={user}>
      <RouterProvider
        router={router}
        context={{ user, strategy }} // injecté dans beforeLoad
      />
    </SecurityProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
```

---

## 7. Utilisation dans les pages

```tsx
// pages/Dashboard.tsx
import { Can, SecureButton, SecureField } from '../security';
import { useState } from 'react';

export const Dashboard = () => {
  const [price, setPrice] = useState('100');

  return (
    <div>
      {/* Affichage conditionnel */}
      <Can perform="read">
        <DataTable />
      </Can>

      {/* Avec fallback */}
      <Can perform="write" fallback={<p>Mode lecture seule</p>}>
        <EditForm />
      </Can>

      {/* Caché si non autorisé */}
      <SecureButton perform="delete" hide onClick={handleDelete}>
        Supprimer
      </SecureButton>

      {/* Champ lecture seule si non autorisé */}
      <SecureField
        perform="write"
        label="Prix"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />
    </div>
  );
};
```

---

## Différences clés vs JavaScript

| Aspect | JS | TS + TanStack |
|---|---|---|
| Actions | strings libres | union type `Action` — erreur à la compilation |
| Stratégie | duck typing | interface `IPermissionStrategy` — contrat strict |
| Contexte routeur | non typé | `RouterContext` injecté et vérifié par le routeur |
| Garde de route | `<PrivateRoute>` wrapper | `beforeLoad` — garde au niveau data, pas UI |
| Redirect | `<Navigate>` dans le rendu | `throw redirect(...)` — avant le rendu |

---

## Règles d'or

- **La sécurité frontend = protection UX uniquement** — toujours valider côté serveur
- **Fail closed** : retourner `false` par défaut quand l'utilisateur est `null`
- **`beforeLoad` plutôt que `<PrivateRoute>`** : la garde s'exécute avant le chargement des données
- **Les composants ne savent pas** quelle stratégie est injectée
- **Logout = invalidation serveur** — ne pas se contenter de vider le localStorage