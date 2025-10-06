# CRUD Permission Guard Examples

This document provides examples of how to implement permission guards for CRUD operations (Create, Read/View, Update, Delete) on routes.

## Quick Reference

### Permission Actions
- `VIEW` - For list pages and detail pages
- `CREATE` - For create/add pages
- `UPDATE` - For edit pages
- `DELETE` - For delete operations

### Guard Functions
- `createPermissionGuard(permission)` - Simple permission check
- `createCrudPermissionGuard(resource, action)` - Auto-builds permission from resource + action
- `createMultiPermissionGuard(permissions, requireAll)` - Check multiple permissions

---

## Method 1: Using `createCrudPermissionGuard` (Recommended)

This method automatically builds the permission string from resource name and action.

### List Page (VIEW)
```typescript
// src/routes/_protected/administration/countries/index.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createCrudPermissionGuard } from "@/shared/guards/permissionGuard"
import { PermissionAction } from "@/shared/utils/permissions"
import { CountriesListPage } from "@/features/countries/pages/CountriesListPage"

export const Route = createFileRoute("/_protected/administration/countries/")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.VIEW),
  component: CountriesListPage,
})
```

### Create Page (CREATE)
```typescript
// src/routes/_protected/administration/countries/add.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createCrudPermissionGuard } from "@/shared/guards/permissionGuard"
import { PermissionAction } from "@/shared/utils/permissions"
import { CreateCountryPage } from "@/features/countries/pages/CreateCountryPage"

export const Route = createFileRoute("/_protected/administration/countries/add")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.CREATE),
  component: CreateCountryPage,
})
```

### Details Page (VIEW)
```typescript
// src/routes/_protected/administration/countries/$id/index.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createCrudPermissionGuard } from "@/shared/guards/permissionGuard"
import { PermissionAction } from "@/shared/utils/permissions"
import { CountryDetailsPage } from "@/features/countries/pages/CountryDetailsPage"

export const Route = createFileRoute("/_protected/administration/countries/$id/")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.VIEW),
  component: CountryDetailsPage,
})
```

### Edit Page (UPDATE)
```typescript
// src/routes/_protected/administration/countries/$id/edit.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createCrudPermissionGuard } from "@/shared/guards/permissionGuard"
import { PermissionAction } from "@/shared/utils/permissions"
import { EditCountryPage } from "@/features/countries/pages/EditCountryPage"

export const Route = createFileRoute("/_protected/administration/countries/$id/edit")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.UPDATE),
  component: EditCountryPage,
})
```

---

## Method 2: Using `createPermissionGuard` (Explicit)

This method requires you to specify the full permission string.

### List Page
```typescript
// src/routes/_protected/access-control/users/index.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import { UsersListPage } from "@/features/users/pages/UsersListPage"

export const Route = createFileRoute("/_protected/access-control/users/")({
  beforeLoad: createPermissionGuard("USER_VIEW"),
  component: UsersListPage,
})
```

### Create Page
```typescript
// src/routes/_protected/access-control/users/add.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import { CreateUserPage } from "@/features/users/pages/CreateUserPage"

export const Route = createFileRoute("/_protected/access-control/users/add")({
  beforeLoad: createPermissionGuard("USER_CREATE"),
  component: CreateUserPage,
})
```

### Edit Page
```typescript
// src/routes/_protected/access-control/users/$id/edit.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"
import { EditUserPage } from "@/features/users/pages/EditUserPage"

export const Route = createFileRoute("/_protected/access-control/users/$id/edit")({
  beforeLoad: createPermissionGuard("USER_UPDATE"),
  component: EditUserPage,
})
```

---

## Method 3: Custom `beforeLoad` with Additional Logic

For complex scenarios where you need additional logic beyond permission checking.

```typescript
// src/routes/_protected/companies/$id/edit.tsx
import { createFileRoute } from "@tanstack/react-router"
import { permissionGuard, PermissionAction, buildPermission } from "@/shared/guards/permissionGuard"

export const Route = createFileRoute("/_protected/companies/$id/edit")({
  beforeLoad: async ({ context, params }) => {
    const userPermissions = context?.session?.permissions || []

    // Check UPDATE permission
    permissionGuard({
      userPermissions,
      requiredPermission: buildPermission("COMPANY", PermissionAction.UPDATE),
    })

    // Additional custom logic
    // e.g., Check if user owns this company
    const userId = context?.session?.id
    const companyId = params.id

    // ... more logic here
  },
  component: EditCompanyPage,
})
```

---

## Method 4: Multiple Permission Checks

For pages that require multiple permissions (user must have ANY or ALL).

### Require ANY Permission (OR)
```typescript
// User needs either COMPANY_VIEW OR APPLICATION_VIEW
import { createMultiPermissionGuard } from "@/shared/guards/permissionGuard"

export const Route = createFileRoute("/_protected/dashboard/")({
  beforeLoad: createMultiPermissionGuard(
    ["COMPANY_VIEW", "APPLICATION_VIEW"],
    false // requireAll = false means ANY permission
  ),
  component: DashboardPage,
})
```

### Require ALL Permissions (AND)
```typescript
// User needs BOTH COMPANY_UPDATE AND APPLICATION_UPDATE
import { createMultiPermissionGuard } from "@/shared/guards/permissionGuard"

export const Route = createFileRoute("/_protected/advanced-settings/")({
  beforeLoad: createMultiPermissionGuard(
    ["COMPANY_UPDATE", "APPLICATION_UPDATE"],
    true // requireAll = true means ALL permissions
  ),
  component: AdvancedSettingsPage,
})
```

---

## Complete CRUD Implementation Example

Here's a complete example for the Countries feature:

```typescript
// 1. LIST PAGE - src/routes/_protected/administration/countries/index.tsx
import { createFileRoute } from "@tanstack/react-router"
import { createCrudPermissionGuard } from "@/shared/guards/permissionGuard"
import { PermissionAction } from "@/shared/utils/permissions"

export const Route = createFileRoute("/_protected/administration/countries/")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.VIEW),
  component: () => import("@/features/countries/pages/CountriesListPage"),
})

// 2. CREATE PAGE - src/routes/_protected/administration/countries/add.tsx
export const Route = createFileRoute("/_protected/administration/countries/add")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.CREATE),
  component: () => import("@/features/countries/pages/CreateCountryPage"),
})

// 3. DETAILS PAGE - src/routes/_protected/administration/countries/$id/index.tsx
export const Route = createFileRoute("/_protected/administration/countries/$id/")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.VIEW),
  component: () => import("@/features/countries/pages/CountryDetailsPage"),
})

// 4. EDIT PAGE - src/routes/_protected/administration/countries/$id/edit.tsx
export const Route = createFileRoute("/_protected/administration/countries/$id/edit")({
  beforeLoad: createCrudPermissionGuard("COUNTRY", PermissionAction.UPDATE),
  component: () => import("@/features/countries/pages/EditCountryPage"),
})
```

---

## Resource Name Reference

Map your routes to these resource names for permissions:

### Administration
- Countries → `COUNTRY`
- Currencies → `CURRENCY`
- Fee Types → `FEETYPE`
- Payment Methods → `PAYMENTMETHOD`
- Withdrawal Methods → `WITHDRAWALMETHOD`
- Fee Configurations → `FEECONFIGURATION`
- Document Types → `DOCUMENTSTYPE`
- Company App Limits → `COMPANYAPPLIMIT`
- Settings → `SETTING`
- Secure Settings → `SECURESETTING`

### Access Control
- Users → `USER`
- User Profiles → `USERPROFILE`
- User Devices → `USERDEVICE`
- User Security → `USERSECURITY`
- User Sessions → `USERSESSION`

### General
- Companies → `COMPANY`
- Applications → `APPLICATION`
- Application Security → `APPLICATIONSECURITY`
- Company User Applications → `COMPANYUSERAPPLICATION`

### Transactions
- Transactions → `TRANSACTION`
- Receipts → `RECEIPTSREADMODEL`
- Withdrawals → `WITHDRAWALSREADMODEL`
- Fund Transfers → `FUNDTRANSFERSREADMODEL`

### IT - Security
- Allowed IPs → `ALLOWEDIP`
- Blocked IPs → `BLOCKEDIP`
- Audit Logs → `AUDITLOG`
- User Devices → `USERDEVICE`

### IT - Webhooks
- Webhooks → `WEBHOOK`
- Webhook Logs → `WEBHOOKLOG`

### IT - Monitoring
- System Logs → `LOG`
- Front Event Logs → `FRONTEVENTLOG`

### Other
- Documents (KYC) → `KYCDOCUMENT`
- Notifications → `NOTIFICATION`
- SMS/Mail Templates → `SMSMAILTEMPLATE`
- OTP Codes → `OTPCODE`
- Password History → `PASSWORDHISTORY`
- Balances → `BALANCESREADMODEL`
- Balance Events → `BALANCEEVENTSTORE`
- Balance Snapshots → `BALANCESNAPSHOT`
- Balance Types → `BALANCETYPE`
- Business Events → `BUSINESSEVENTSTORE`
- Event Snapshots → `EVENTSNAPSHOT`
- Metrics → `DAILYMETRIC`, `SYSTEMMETRIC`, `DAILYMETRICSBYPAYMENTMETHOD`
- Projections → `PROJECTIONCHECKPOINT`, `VWTRANSACTIONSSUMMARY`

---

## Delete Operations (Button/Action Level)

For delete buttons/actions, check permissions in the component:

```typescript
import { hasPermission } from "@/shared/utils/permissions"
import { useSessionStore } from "@/shared/stores"
import { buildPermission, PermissionAction } from "@/shared/utils/permissions"

function CountryListItem({ country }) {
  const { user } = useSessionStore()
  const canDelete = hasPermission(user?.permissions, buildPermission("COUNTRY", PermissionAction.DELETE))

  return (
    <div>
      {/* Show delete button only if user has permission */}
      {canDelete && (
        <Button onClick={() => handleDelete(country.id)}>
          Delete
        </Button>
      )}
    </div>
  )
}
```

---

## Testing Checklist

For each CRUD feature, verify:

- [ ] List page requires `{RESOURCE}_VIEW`
- [ ] Create page requires `{RESOURCE}_CREATE`
- [ ] Details page requires `{RESOURCE}_VIEW`
- [ ] Edit page requires `{RESOURCE}_UPDATE`
- [ ] Delete button/action requires `{RESOURCE}_DELETE`
- [ ] Unauthorized users are redirected to `/unauthorized`
- [ ] Menu items are hidden for users without permissions

---

## Quick Implementation Steps

1. **For each feature**, add guards to these routes:
   - `index.tsx` → `VIEW`
   - `add.tsx` → `CREATE`
   - `$id/index.tsx` → `VIEW`
   - `$id/edit.tsx` → `UPDATE`

2. **Use the pattern:**
   ```typescript
   beforeLoad: createCrudPermissionGuard("RESOURCE_NAME", PermissionAction.ACTION)
   ```

3. **For delete operations**, check permission in component before showing delete button

4. **Test** with users having different permission sets
