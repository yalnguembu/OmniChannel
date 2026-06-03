import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { loginSchema } from "@/lib/validators";
import { useAuthStore } from "@/store/authStore";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { postApiAuthLoginMutation } from "@/shared/api/generated/@tanstack/react-query.gen";
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
      setSession({
        accessToken: payload?.accessToken,
        refreshToken: payload?.refreshToken,
        user: payload?.user ?? null,
      });
      navigate({ to: "/dashboard" });
    },
    onError: createFormMutationErrorHandler(setError, {
      toastMessage: "Email ou mot de passe incorrect",
    }),
  });

  // --- Handlers ---
  const onSubmit = useCallback(
    (data: LoginForm) => {
      loginMutation.mutate({ body: data });
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
