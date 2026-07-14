/** Auth-related user types & routing helpers. */

/**
 * Canonical user types used across the app. The backend returns one of these
 * on `user.userType`. Use these constants — never hardcode the raw strings.
 */
export const USER_TYPE = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  SYSTEM_USER: "SYSTEM_USER",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  COMPANY_USER: "COMPANY_USER",
} as const;

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

const SYSTEM_TYPES: readonly string[] = [
  USER_TYPE.SYSTEM_ADMIN,
  USER_TYPE.SYSTEM_USER,
];
const COMPANY_TYPES: readonly string[] = [
  USER_TYPE.COMPANY_ADMIN,
  USER_TYPE.COMPANY_USER,
];

/** System staff (backoffice). Tolerates the legacy "system" value. */
export function isSystemUser(userType?: string | null): boolean {
  const t = (userType ?? "").toUpperCase();
  return SYSTEM_TYPES.includes(t) || t === "SYSTEM";
}

/** Company member (portal). Tolerates the legacy "company" value. */
export function isCompanyUser(userType?: string | null): boolean {
  const t = (userType ?? "").toUpperCase();
  return COMPANY_TYPES.includes(t) || t === "COMPANY";
}

/** Admin role (either system or company admin). */
export function isAdminRole(userType?: string | null): boolean {
  const t = (userType ?? "").toUpperCase();
  return t === USER_TYPE.SYSTEM_ADMIN || t === USER_TYPE.COMPANY_ADMIN;
}

/** The landing dashboard for a given user type. */
export function dashboardPathFor(
  userType?: string | null,
): "/admin" | "/dashboard" {
  return isSystemUser(userType) ? "/admin" : "/dashboard";
}

/**
 * Validate a post-login `returnUrl`: only same-origin, absolute in-app paths
 * are accepted. Rejects external / protocol-relative URLs and the auth pages
 * themselves (which would cause a redirect loop). Returns undefined if unsafe.
 */
export function sanitizeReturnUrl(value?: string | null): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  const path = value.split("?")[0].split("#")[0];
  const blocked = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/change-password",
  ];
  if (blocked.some((p) => path === p || path.startsWith(p + "/"))) {
    return undefined;
  }
  return value;
}
