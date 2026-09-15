import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogOut, Wallet, ShieldCheck, TriangleAlert } from "lucide-react";
import { ReaboSheet, ReaboPrimaryButton, ReaboGhostButton } from "./ReaboSheet";
import { useReaboAuth, useReaboSolde } from "@/hooks/useReaboAuth";
import { fmtFcfa } from "@/models/reabo.models";
import { REABO_BASE_URL } from "@/shared/api/reabo/client";
import { TONE_ERROR_BAND, TONE_ERROR_TEXT, TONE_FIELD_FOCUS } from "./tone";

const FormSchema = z.object({
  login: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});
type FormValues = z.infer<typeof FormSchema>;

const fieldClass =
  `w-full rounded-lg border border-wa-border bg-white px-3 py-2.5 text-sm text-wa-text ${TONE_FIELD_FOCUS}`;

interface ReaboConnectionSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Connection to ReaboCanal — the one place the agent types their fujisat
 * credentials.
 *
 * Signing in and verifying are the same action: `connect()` reads the profile
 * and the balance before keeping the session, so reaching the connected state
 * below already proves the token works. The password is never stored.
 */
export const ReaboConnectionSheet: React.FC<ReaboConnectionSheetProps> = ({
  open,
  onClose,
}) => {
  const { status, account, permissions, isConnecting, error, connect, disconnect } =
    useReaboAuth();
  const solde = useReaboSolde();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { login: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const ok = await connect(values.login.trim(), values.password);
    if (ok) {
      form.reset();
      onClose();
    } else {
      // Keep the login, clear the password — the identifier is rarely the
      // thing that was wrong.
      form.setValue("password", "");
    }
  };

  const isConnected = status === "connected";
  const hasSession = isConnected || status === "expired";

  return (
    <ReaboSheet
      open={open}
      title="Connexion Reabo"
      onClose={onClose}
      footer={
        hasSession ? (
          <div className="flex items-center gap-2">
            <ReaboGhostButton onClick={disconnect} className="flex-1">
              <LogOut size={16} />
              Se déconnecter
            </ReaboGhostButton>
            <ReaboPrimaryButton onClick={onClose} className="flex-1">
              Fermer
            </ReaboPrimaryButton>
          </div>
        ) : (
          <ReaboPrimaryButton
            onClick={form.handleSubmit(onSubmit)}
            disabled={isConnecting}
          >
            {isConnecting && <Loader2 size={16} className="animate-spin" />}
            Tester et enregistrer la connexion
          </ReaboPrimaryButton>
        )
      }
    >
      {hasSession ? (
        <div className="px-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border border-wa-border px-3 py-3">
            {isConnected ? (
              <ShieldCheck className="size-5 shrink-0 text-wa-teal" />
            ) : (
              <TriangleAlert className="size-5 shrink-0 text-[#c8891f]" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-wa-text">
                {account?.name || "Compte Reabo"}
              </p>
              <p className="truncate text-sm text-wa-muted">
                {account?.userName}
                {account?.profil ? ` · ${account.profil}` : ""}
              </p>
              {status === "expired" && (
                <p className="mt-1 text-sm text-[#c8891f]">
                  Session expirée — reconnectez-vous pour reprendre les opérations.
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-wa-border px-3 py-2">
            <div className="flex items-center gap-2 py-1 text-sm">
              <Wallet className="size-4 text-wa-icon" />
              <span className="text-wa-muted">Solde opérations</span>
              <span className="ml-auto font-medium tabular-nums text-wa-text">
                {solde.isLoading ? "…" : fmtFcfa(solde.data?.soldeOperations ?? null)}
              </span>
            </div>
            <div className="flex items-center gap-2 py-1 text-sm">
              <Wallet className="size-4 text-wa-icon" />
              <span className="text-wa-muted">Solde commissions</span>
              <span className="ml-auto font-medium tabular-nums text-wa-text">
                {solde.isLoading ? "…" : fmtFcfa(solde.data?.soldeCommissions ?? null)}
              </span>
            </div>
          </div>

          <p className="break-all pt-3 text-xs text-wa-muted">
            {REABO_BASE_URL}
            {permissions.length > 0 && ` · ${permissions.length} permissions`}
          </p>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 py-4">
          <p className="text-sm text-wa-muted">
            Identifiants du compte fujisat utilisé pour les opérations de
            réabonnement.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="reabo-login" className="block text-xs text-wa-muted">
              Identifiant
            </label>
            <input
              id="reabo-login"
              autoComplete="username"
              className={fieldClass}
              {...form.register("login")}
            />
            {form.formState.errors.login && (
              <p className={`text-sm ${TONE_ERROR_TEXT}`}>
                {form.formState.errors.login.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reabo-password" className="block text-xs text-wa-muted">
              Mot de passe
            </label>
            <input
              id="reabo-password"
              type="password"
              autoComplete="current-password"
              className={fieldClass}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className={`text-sm ${TONE_ERROR_TEXT}`}>
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <p className={`rounded-lg px-3 py-2 text-sm ${TONE_ERROR_BAND}`}>
              {error}
            </p>
          )}

          {/* Submits through the footer button too; this one keeps Enter working. */}
          <button type="submit" className="hidden" aria-hidden />
        </form>
      )}
    </ReaboSheet>
  );
};
