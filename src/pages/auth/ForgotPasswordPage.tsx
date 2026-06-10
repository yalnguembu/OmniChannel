import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { requestPasswordReset } from "@/shared/api/authPassword";
import { OctoLogo } from "../landing/components/OctoLogo";

const schema = z.object({
  email: z.string().email("Email invalide"),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { createFormMutationErrorHandler } = useErrorHandling();

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => requestPasswordReset(values.email),
    onError: createFormMutationErrorHandler(setError, {
      toastMessage: "Impossible d'envoyer le lien de réinitialisation",
    }),
  });

  const sent = mutation.isSuccess;

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

          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#E8F4F8] flex items-center justify-center mx-auto mb-3">
                <MailCheck size={22} className="text-[#2E8FAD]" />
              </div>
              <h1 className="text-[22px] font-semibold text-[#0D2137] tracking-tight mb-1">
                Vérifiez vos emails
              </h1>
              <p className="text-[13px] text-[#4A7A94] mb-6">
                Si un compte existe pour{" "}
                <span className="font-medium text-[#0D2137]">
                  {getValues("email")}
                </span>
                , un lien de réinitialisation vient d'être envoyé.
              </p>
              <Link
                to="/login"
                className="text-[13px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] text-center font-semibold text-[#0D2137] tracking-tight mb-1">
                Mot de passe oublié
              </h1>
              <p className="text-[13px] text-center text-[#4A7A94] mb-7">
                Saisissez votre email pour recevoir un lien de réinitialisation.
              </p>

              <form
                onSubmit={handleSubmit((d) => mutation.mutate(d))}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Button
                  variant="primary"
                  type="submit"
                  loading={mutation.isPending}
                  className="mt-1 w-full justify-center py-2.5 text-[14px]"
                >
                  Envoyer le lien
                </Button>
              </form>

              <div className="flex justify-center mt-5">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-[13px] text-[#4A7A94] hover:text-[#0D2137] transition-colors"
                >
                  <ArrowLeft size={14} />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
