import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { resetPassword } from "@/shared/api/authPassword";
import { OctoLogo } from "../landing/components/OctoLogo";

const schema = z
  .object({
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

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/reset-password" });
  const { createFormMutationErrorHandler } = useErrorHandling();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      resetPassword({ token: token ?? "", newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé");
      navigate({ to: "/login" });
    },
    onError: createFormMutationErrorHandler(setError, {
      toastMessage: "Lien invalide ou expiré",
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
            Réinitialiser le mot de passe
          </h1>
          <p className="text-[13px] text-center text-[#4A7A94] mb-7">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          {!token ? (
            <div className="text-center">
              <p className="text-[13px] text-[#DC2626] mb-5">
                Lien de réinitialisation invalide ou incomplet.
              </p>
              <Link
                to="/forgot-password"
                className="text-[13px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors"
              >
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((d) => mutation.mutate(d))}
              className="flex flex-col gap-4"
            >
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
                Réinitialiser
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
