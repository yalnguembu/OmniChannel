import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validators";
import { useAuthStore } from "@/store/authStore";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { postApiAuthLoginMutation } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { LoginRequest } from "@/shared/api/generated/types.gen";
import { dashboardPathFor } from "@/lib/auth";
import { getDeviceInfo } from "@/lib/device";
import type { z } from "zod";

export type LoginForm = z.infer<typeof loginSchema>;

/**
 * ViewModel for the Login flow.
 */
export function useLoginViewModel() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const { createFormMutationErrorHandler } = useErrorHandling();

  // --- Form State ---
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // --- Mutations ---
  const loginMutation = useMutation({
    ...postApiAuthLoginMutation(),
    onSuccess: (res: any) => {
      const payload = res?.data ?? res;
      const user = payload?.user ?? null;
      // `requiresPasswordChange` is not yet in the generated LoginResponse —
      // read it defensively so it works as soon as the API exposes it.
      const requiresPasswordChange = Boolean(
        payload?.requiresPasswordChange ??
          payload?.user?.requiresPasswordChange ??
          payload?.forcePasswordChange,
      );

      setSession({
        accessToken: payload?.accessToken,
        refreshToken: payload?.refreshToken,
        user,
        requiresPasswordChange,
      });

      // Heads-up when signing in from a device the backend hasn't seen before.
      if (payload?.isNewDevice) {
        toast.warning("Nouvel appareil détecté", {
          description:
            "Cette connexion provient d'un appareil inhabituel. Si ce n'était pas vous, changez votre mot de passe.",
        });
      }

      if (requiresPasswordChange) {
        // navigate({ to: "/change-password" });
        // return;
      }
      // Send each user to their own dashboard (system → admin backoffice).
      navigate({ to: dashboardPathFor(user?.userType) });
    },
    onError: createFormMutationErrorHandler(setError, {
      toastMessage: "Email ou mot de passe incorrect",
    }),
  });

  // --- Handlers ---
  const onSubmit = useCallback(
    (data: LoginForm) => {
      // Email/password come from the form; platform / hardwareId /
      // screenResolution are filled in the background.
      const body: LoginRequest = {
        email: data.email,
        password: data.password,
        ...getDeviceInfo(),
      };
      loginMutation.mutate({ body });
    },
    [loginMutation],
  );

  return {
    // State
    errors,
    isSubmitting: loginMutation.isPending,

    // Handlers
    register,
    handleSubmit: handleSubmit(onSubmit),
  };
}
