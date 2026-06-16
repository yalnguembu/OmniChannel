import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { changePassword } from "@/shared/api/authPassword";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
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

/** Self-service password change (POST /api/auth/change-password). */
export function ChangePasswordCard() {
  const { createFormMutationErrorHandler } = useErrorHandling();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: () => {
      toast.success("Mot de passe mis à jour");
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: createFormMutationErrorHandler(setError, {
      toastMessage: "Impossible de modifier le mot de passe",
    }),
  });

  return (
    <div className="max-w-6xl overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F7F8F9] px-5 py-3.5">
        <KeyRound size={15} className="text-[#2E8FAD]" />
        <p className="text-[13px] font-medium text-[#0D2137]">Mot de passe</p>
      </div>
      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="flex flex-col gap-4 p-5"
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
          className="self-start w-full"
        >
          Mettre à jour
        </Button>
      </form>
    </div>
  );
}
