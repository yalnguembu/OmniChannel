# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Build TypeScript and production bundle
- `npm run build:prod` - Generate routes and build for production

### Code Quality
- `npm run lint` - Lint all files with ESLint
- `npm run format` - Format TypeScript/TSX files with Prettier
- `npm run format:check` - Check if files are properly formatted

### Testing
- `npm run cypress:open` - Open Cypress test runner (interactive)
- `npm run test:e2e` - Run end-to-end tests in headless mode

### API & Routing
- `npm run generate:route` - Generate TanStack Router routes
- `npm run generate:api` - Generate API client from OpenAPI spec

### Internationalization
- `npm run parse` - Extract translatable strings and generate types

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
Cypress end-to-end tests cover complete authentication flow including OTP verification, password setting, and 2FA setup. Tests use mock API responses and custom commands for common operations.