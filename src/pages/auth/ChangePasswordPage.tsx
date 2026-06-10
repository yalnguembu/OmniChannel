import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { changePassword } from "@/shared/api/authPassword";
import { dashboardPathFor } from "@/lib/auth";
import { OctoLogo } from "../landing/components/OctoLogo";

const schema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .max(100, "100 caractères maximum"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const requiresPasswordChange = useAuthStore((s) => s.requiresPasswordChange);
  const setRequiresPasswordChange = useAuthStore(
    (s) => s.setRequiresPasswordChange,
  );
  const { createFormMutationErrorHandler } = useErrorHandling();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      changePassword({
        currentPassword: values.currentPassword || undefined,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      setRequiresPasswordChange(false);
      toast.success("Mot de passe mis à jour");
      navigate({ to: dashboardPathFor(user?.userType) });
    },
    onError: createFormMutationErrorHandler(setError, {
      toastMessage: "Impossible de modifier le mot de passe",
    }),
  });

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-140"
      >
        <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(13,33,55,0.08)] border border-[#E5E7EB]/60 p-8">
          <div className="w-full flex justify-center">
            <OctoLogo size={100} />
          </div>

          <h1 className="text-[22px] text-center font-semibold text-[#0D2137] tracking-tight mb-1">
            {requiresPasswordChange
              ? "Définir un nouveau mot de passe"
              : "Changer le mot de passe"}
          </h1>
          <p className="text-[13px] text-center text-[#4A7A94] mb-6">
            {requiresPasswordChange
              ? "Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer."
              : "Mettez à jour votre mot de passe"}
          </p>

          {requiresPasswordChange && (
            <div className="flex items-start gap-2 p-3 mb-5 rounded-md bg-[#FEF3C7] border border-[#FCD34D]">
              <ShieldAlert size={15} className="text-[#D97706] mt-0.5 shrink-0" />
              <p className="text-[12.5px] text-[#92400E]">
                Changement de mot de passe requis sur ce compte.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="flex flex-col gap-4"
          >
            <Input
              label="Mot de passe actuel"
              type="password"
              placeholder="••••••••"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button
              variant="primary"
              type="submit"
              loading={mutation.isPending}
              className="mt-1 w-full justify-center py-2.5 text-[14px]"
            >
              Enregistrer le mot de passe
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
