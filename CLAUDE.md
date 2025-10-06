# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Vite (proxies `/api` requests to production)
- `npm run build` - Build production bundle with Vite
- `npm run build:prod` - Generate routes AND build for production
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Lint all files with ESLint
- `npm run format` - Format TypeScript/TSX files with Prettier
- `npm run format:check` - Check if files are properly formatted

### Testing
- `npm run cypress:open` - Open Cypress test runner (interactive)
- `npm run test:e2e` - Run end-to-end tests in headless mode

### API & Routing
- `npm run generate:route` - Generate TanStack Router routes from `/src/routes/**/*.tsx`
- `npm run generate:api` - Generate API client from OpenAPI spec (`spec.yml` → `/src/shared/api`)
- `npm run generate:components` - Auto-generate components (uses `generator/` directory)

### Internationalization
- `npm run parse` - Extract translatable strings and generate TypeScript types

### Releases
- `npm run release:dev` - Create pre-release version with standard-version
- `npm run release:prod` - Create production release with standard-version

## Architecture Overview

### Tech Stack
- **React 19** with TypeScript for UI components
- **TanStack Router** for file-based routing with type safety
- **Zustand** for state management (with persist, devtools, and immer middleware)
- **TailwindCSS 4** for styling with custom design system
- **React Hook Form + Zod** for form handling and validation
- **TanStack Query** for server state management
- **i18next** for internationalization

### Project Structure

#### Route Organization
- `/src/routes/__root.tsx` - Root layout component
- `/src/routes/_protected.tsx` - Authentication guard for protected routes
- `/src/routes/_protected/*` - Protected admin/dashboard pages
- `/src/routes/_public/*` - Public marketing/auth pages
- Session-based authentication check in `_protected.tsx` using `sessionStore.getIsLoggedIn()`

#### Feature-Based Architecture
Each domain feature follows consistent structure in `/src/features/`:
```
features/[domain]/
├── components/          # Feature-specific UI components
│   ├── [Domain]CreateForm.tsx
│   ├── [Domain]EditForm.tsx
│   └── [Domain]DataGrid.tsx
├── hooks/              # Domain-specific hooks
├── pages/              # Feature page components
├── stores/             # Zustand stores for domain state
└── lib/data-grid/      # Data grid configurations
```

#### Shared Architecture
- `/src/shared/api/` - Auto-generated API client from OpenAPI spec
- `/src/shared/components/` - Reusable UI components and layouts
- `/src/shared/stores/` - Global stores (sessionStore, errorStore, uiStore)
- `/src/shared/lib/` - Utility functions and configurations

### State Management Patterns
- **Session Management**: `sessionStore` handles authentication state with persistence
- **Feature Stores**: Each domain has dedicated Zustand store following consistent pattern
- **API State**: TanStack Query for server state caching and synchronization
- All stores use immer middleware for immutable updates and devtools for debugging

### Authentication Flow
Protected routes check authentication via `sessionStore.getIsLoggedIn()` and redirect to `/auth/login` if unauthenticated. Session data persists across browser sessions.

### API Integration
Auto-generated client from OpenAPI specification provides type-safe API calls. Axios interceptors handle authentication and error responses globally.

### Form Patterns
React Hook Form with Zod validation schemas provide type-safe form handling. Consistent patterns across create/edit forms for each domain.

### Testing Strategy
Cypress end-to-end tests in `/cypress/e2e/` cover:
- Complete authentication flow (OTP → password → 2FA)
- Accessibility testing (a11y)
- Error handling scenarios

Tests use mock API responses and custom commands for common operations.

### Permission System
The application implements role-based access control (RBAC):
- Each menu item can have an optional `permission` field (e.g., `"COUNTRY_VIEW"`)
- User permissions are stored in session and checked via `sessionStore`
- Permission guards can be applied to routes using `createPermissionGuard()` from `/src/shared/guards/permissionGuard.ts`
- Permissions follow pattern: `{MODULE}_{ACTION}` where ACTION is CREATE, UPDATE, DELETE, or VIEW
- Menu items are filtered client-side based on user permissions using `filterMenuByPermissions()`

### Important Patterns
- **Path Aliases**: Use `@/` for imports (resolves to `/src`)
- **API Generation**: All API code in `/src/shared/api` is auto-generated from `spec.yml` using `@hey-api/openapi-ts`. DO NOT manually edit files in this directory.
- **Route Generation**: Routes are auto-generated from file structure in `/src/routes`. Run `npm run generate:route` after adding/modifying route files.
- **i18n Keys**: Translation keys use dot notation (e.g., `menu.Dashboard`). Run `npm run parse` to extract new keys.
- **Store Pattern**: All Zustand stores use immer middleware for immutable updates and devtools for debugging
- **Vite Proxy**: Development server proxies `/api/*` requests to production backend for local development