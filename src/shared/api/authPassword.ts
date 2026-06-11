import { client } from "@/shared/api/generated/client.gen";

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

/**
 * NOTE: there is currently NO password endpoint in the generated SDK
 * (neither `spec.yaml` nor `swagger.json` expose change/forgot/reset). These
 * wrappers hit the assumed `/api/auth/*` routes via the already-configured
 * axios instance (Bearer token injected by `setup.ts`). Once the backend
 * publishes the endpoints and they are regenerated, swap these for the
 * generated SDK calls — this file is the single place to change.
 */

/** Change the connected user's password. */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await client.instance.post("/api/auth/change-password", payload);
}

/** Request a reset link/code for a forgotten password (by email). */
export async function requestPasswordReset(email: string): Promise<void> {
  await client.instance.post("/api/auth/forgot-password", { email });
}

/** Set a new password using the token received by email. */
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  await client.instance.post("/api/auth/reset-password", payload);
}
