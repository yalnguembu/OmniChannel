# Permission-Based Route Protection Implementation

## Summary

This document describes the implementation of permission-based access control for routes and menus.

## Files Created

### 1. `/src/shared/utils/permissions.ts`
Utility functions for checking permissions:
- `hasPermission()` - Check if user has a specific permission
- `hasAnyPermission()` - Check if user has any of the specified permissions
- `hasAllPermissions()` - Check if user has all specified permissions
- `filterMenuByPermissions()` - Filter menu items based on user permissions

### 2. `/src/shared/guards/permissionGuard.ts`
Route guard middleware:
- `permissionGuard()` - Check permission and redirect if unauthorized
- `createPermissionGuard()` - Factory function to create beforeLoad guards

### 3. Updated `/src/shared/types/menu.ts`
Added `permission?:string` field to menu item types

## Menu Permissions Mapping

Add the `permission` field to each menu item in `/src/shared/lib/menu.ts`:

```typescript
// Administration submenu
{
  label: "menu.countries",
  path: "/administration/countries",
  permission: "COUNTRY_VIEW", // ADD THIS
},
{
  label: "menu.currencies",
  path: "/administration/currencies",
  permission: "CURRENCY_VIEW", // ADD THIS
},
{
  label: "menu.feeTypes",
  path: "/administration/fee-types",
  permission: "FEETYPE_VIEW", // ADD THIS
},
{
  label: "menu.paymentMethod",
  path: "/administration/payment-methods",
  permission: "PAYMENTMETHOD_VIEW", // ADD THIS
},
{
  label: "menu.withdrawalMethod",
  path: "/administration/withdrawal-methods",
  permission: "WITHDRAWALMETHOD_VIEW", // ADD THIS
},
{
  label: "menu.feeConfigurations",
  path: "/administration/fee-configurations",
  permission: "FEECONFIGURATION_VIEW", // ADD THIS
},
{
  label: "menu.documentType",
  path: "/administration/document-types",
  permission: "DOCUMENTSTYPE_VIEW", // ADD THIS
},
{
  label: "menu.companyAppLimit",
  path: "/administration/company-app-limits",
  permission: "COMPANYAPPLIMIT_VIEW", // ADD THIS
},
{
  label: "menu.settings",
  path: "/administration/settings",
  permission: "SETTING_VIEW", // ADD THIS
},
{
  label: "menu.secureSettings",
  path: "/administration/secure-settings",
  permission: "SECURESETTING_VIEW", // ADD THIS
},

// Access Control submenu
{
  label: "menu.users",
  path: "/access-control/users",
  permission: "USER_VIEW", // ADD THIS
},
{
  label: "menu.userProfiles",
  path: "/access-control/user-profiles",
  permission: "USERPROFILE_VIEW", // ADD THIS
},

// General menu
{
  label: "menu.companies",
  path: "/companies",
  permission: "COMPANY_VIEW", // ADD THIS
},
{
  label: "menu.applications",
  path: "/applications",
  permission: "APPLICATION_VIEW", // ADD THIS
},

// Transactions submenu
{
  label: "menu.all",
  path: "/transactions",
  permission: "TRANSACTION_VIEW", // ADD THIS
},
{
  label: "menu.receipts",
  path: "/transactions/receipts",
  permission: "RECEIPTSREADMODEL_VIEW", // ADD THIS
},
{
  label: "menu.withdrawals",
  path: "/transactions/withdrawals",
  permission: "WITHDRAWALSREADMODEL_VIEW", // ADD THIS
},

// IT - Webhooks
{
  label: "menu.webhooks",
  path: "/webhooks",
  permission: "WEBHOOK_VIEW", // ADD THIS
},

// IT - Audit & Security submenu
{
  label: "menu.allowedIps",
  path: "/audit-security/allowed-ips",
  permission: "ALLOWEDIP_VIEW", // ADD THIS
},
{
  label: "menu.blockedIps",
  path: "/audit-security/blocked-ips",
  permission: "BLOCKEDIP_VIEW", // ADD THIS
},
{
  label: "menu.auditLogs",
  path: "/audit-security/audit-logs",
  permission: "AUDITLOG_VIEW", // ADD THIS
},
{
  label: "menu.userDevices",
  path: "/audit-security/user-devices",
  permission: "USERDEVICE_VIEW", // ADD THIS
},

// IT - Monitoring submenu
{
  label: "menu.logs",
  path: "/monitoring/system-logs",
  permission: "LOG_VIEW", // ADD THIS
},
{
  label: "menu.frontEvents",
  path: "/monitoring/front-events",
  permission: "FRONTEVENTLOG_VIEW", // ADD THIS
},
{
  label: "menu.webHookLogs",
  path: "/monitoring/web-hook-logs",
  permission: "WEBHOOKLOG_VIEW", // ADD THIS
},
```

## Update _protected.tsx Route

Update `/src/routes/_protected.tsx` to pass user permissions in context:

```typescript
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import { useSessionStore } from "@/shared/stores"
import { useQuery } from "@tanstack/react-query"
import { getApiUserMeOptions } from "@/shared/api/@tanstack/react-query.gen"

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const sessionStore = useSessionStore.getState()
    if (!sessionStore.getIsLoggedIn()) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: window.location.pathname,
        },
      })
    }
  },
  // Add loader to fetch user data and pass permissions in context
  loader: async () => {
    // Fetch user data to get permissions
    const sessionStore = useSessionStore.getState()
    return {
      session: sessionStore.user,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  // Fetch user permissions and store them
  const { data } = useQuery(getApiUserMeOptions())

  return <Outlet context={{ session: data?.data }} />
}
```

## Usage in Sidebar

Update sidebar component to filter menus by permissions:

```typescript
import { filterMenuByPermissions } from "@/shared/utils/permissions"
import { useSessionStore } from "@/shared/stores"
import { adminMenus } from "@/shared/lib/menu"

// In your sidebar component
const { user } = useSessionStore()
const filteredMenus = filterMenuByPermissions(adminMenus, user?.permissions || [])

// Use filteredMenus to render only accessible menu items
```

## Usage in Routes

Add permission check to individual routes:

### Example 1: Simple permission check in route file

```typescript
// src/routes/_protected/administration/countries/index.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

export const Route = createFileRoute("/_protected/administration/countries/")({
  beforeLoad: createPermissionGuard("COUNTRY_VIEW"),
  component: CountriesListPage,
})
```

### Example 2: Custom beforeLoad with permission check

```typescript
// src/routes/_protected/access-control/users/index.tsx
import { createFileRoute } from "@tanstack/react-router"
import { permissionGuard } from "@/shared/guards/permissionGuard"

export const Route = createFileRoute("/_protected/access-control/users/")({
  beforeLoad: async ({ context }) => {
    const userPermissions = context?.session?.permissions || []

    permissionGuard({
      userPermissions,
      requiredPermission: "USER_VIEW",
    })

    // Additional logic can go here
  },
  component: UsersListPage,
})
```

## Permission Values Reference

Based on the API response, here are all available permissions:

### Module Applications
- APPLICATION_CREATE, APPLICATION_UPDATE, APPLICATION_DELETE, APPLICATION_VIEW
- APPLICATIONSECURITY_CREATE, APPLICATIONSECURITY_UPDATE, APPLICATIONSECURITY_DELETE, APPLICATIONSECURITY_VIEW

### Module Audit
- AUDITLOG_CREATE, AUDITLOG_UPDATE, AUDITLOG_DELETE, AUDITLOG_VIEW
- FRONTEVENTLOG_CREATE, FRONTEVENTLOG_UPDATE, FRONTEVENTLOG_DELETE, FRONTEVENTLOG_VIEW
- LOG_CREATE, LOG_UPDATE, LOG_DELETE, LOG_VIEW

### Module Companies
- COMPANY_CREATE, COMPANY_UPDATE, COMPANY_DELETE, COMPANY_VIEW
- COMPANYAPPLIMIT_CREATE, COMPANYAPPLIMIT_UPDATE, COMPANYAPPLIMIT_DELETE, COMPANYAPPLIMIT_VIEW
- COMPANYUSERAPPLICATION_CREATE, COMPANYUSERAPPLICATION_UPDATE, COMPANYUSERAPPLICATION_DELETE, COMPANYUSERAPPLICATION_VIEW

### Module Configuration
- SETTING_CREATE, SETTING_UPDATE, SETTING_DELETE, SETTING_VIEW
- SECURESETTING_CREATE, SECURESETTING_UPDATE, SECURESETTING_DELETE, SECURESETTING_VIEW

### Module Documents
- DOCUMENTSTYPE_CREATE, DOCUMENTSTYPE_UPDATE, DOCUMENTSTYPE_DELETE, DOCUMENTSTYPE_VIEW
- KYCDOCUMENT_CREATE, KYCDOCUMENT_UPDATE, KYCDOCUMENT_DELETE, KYCDOCUMENT_VIEW

### Module Fees
- FEETYPE_CREATE, FEETYPE_UPDATE, FEETYPE_DELETE, FEETYPE_VIEW
- FEECONFIGURATION_CREATE, FEECONFIGURATION_UPDATE, FEECONFIGURATION_DELETE, FEECONFIGURATION_VIEW

### Module Geography
- COUNTRY_CREATE, COUNTRY_UPDATE, COUNTRY_DELETE, COUNTRY_VIEW
- CURRENCY_CREATE, CURRENCY_UPDATE, CURRENCY_DELETE, CURRENCY_VIEW

### Module Payments
- PAYMENTMETHOD_CREATE, PAYMENTMETHOD_UPDATE, PAYMENTMETHOD_DELETE, PAYMENTMETHOD_VIEW
- TRANSACTION_CREATE, TRANSACTION_UPDATE, TRANSACTION_DELETE, TRANSACTION_VIEW
- WITHDRAWALMETHOD_CREATE, WITHDRAWALMETHOD_UPDATE, WITHDRAWALMETHOD_DELETE, WITHDRAWALMETHOD_VIEW

### Module Security
- ALLOWEDIP_CREATE, ALLOWEDIP_UPDATE, ALLOWEDIP_DELETE, ALLOWEDIP_VIEW
- BLOCKEDIP_CREATE, BLOCKEDIP_UPDATE, BLOCKEDIP_DELETE, BLOCKEDIP_VIEW

### Module Transactions
- RECEIPTSREADMODEL_CREATE, RECEIPTSREADMODEL_UPDATE, RECEIPTSREADMODEL_DELETE, RECEIPTSREADMODEL_VIEW
- WITHDRAWALSREADMODEL_CREATE, WITHDRAWALSREADMODEL_UPDATE, WITHDRAWALSREADMODEL_DELETE, WITHDRAWALSREADMODEL_VIEW
- FUNDTRANSFERSREADMODEL_CREATE, FUNDTRANSFERSREADMODEL_UPDATE, FUNDTRANSFERSREADMODEL_DELETE, FUNDTRANSFERSREADMODEL_VIEW

### Module Users
- USER_CREATE, USER_UPDATE, USER_DELETE, USER_VIEW
- USERPROFILE_CREATE, USERPROFILE_UPDATE, USERPROFILE_DELETE, USERPROFILE_VIEW
- USERDEVICE_CREATE, USERDEVICE_UPDATE, USERDEVICE_DELETE, USERDEVICE_VIEW
- USERSECURITY_CREATE, USERSECURITY_UPDATE, USERSECURITY_DELETE, USERSECURITY_VIEW
- USERSESSION_CREATE, USERSESSION_UPDATE, USERSESSION_DELETE, USERSESSION_VIEW

### Module Webhooks
- WEBHOOK_CREATE, WEBHOOK_UPDATE, WEBHOOK_DELETE, WEBHOOK_VIEW
- WEBHOOKLOG_CREATE, WEBHOOKLOG_UPDATE, WEBHOOKLOG_DELETE, WEBHOOKLOG_VIEW

## Testing

1. Create test users with different permissions
2. Login with each user
3. Verify:
   - Menu items without required permissions are hidden
   - Direct navigation to unauthorized routes redirects to `/unauthorized`
   - Users with permissions can access their assigned routes

## Next Steps

1. ✅ Add `permission` field to all menu items in menu.ts
2. ✅ Update `_protected.tsx` to pass permissions in context
3. ✅ Update sidebar to filter menus by permissions
4. ✅ Add `beforeLoad` guards to all protected routes
5. Create `/unauthorized` page to display when access is denied
