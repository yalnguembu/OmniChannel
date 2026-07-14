import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLoginViewModel } from "@/hooks/useLoginViewModel";
import { OctoLogo } from "../landing/components/OctoLogo";

export function LoginPage() {
  const vm = useLoginViewModel();

  return (
    <div className="min-h-dvh bg-[#F4F5F6] flex justify-center items-end p-0 sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full sm:max-w-140"
      >
        <div className="bg-white p-6 sm:p-8 pb-12 rounded-none max-sm:rounded-t-2xl sm:rounded-xl border-t sm:border border-[#E5E7EB]/60 shadow-none sm:shadow-[0_4px_24px_rgba(13,33,55,0.08)]">
          <div className="w-full flex justify-center">
            <OctoLogo size={100} />
          </div>

          <h1 className="text-[22px] text-center font-semibold text-[#0D2137] tracking-tight mb-1">
            Connexion
          </h1>
          <p className="text-[13px] text-center text-[#4A7A94] mb-7">
            Accédez à votre espace OmniChannel
          </p>

          <form onSubmit={vm.handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@example.com"
              error={vm.errors.email?.message}
              {...vm.register("email")}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              error={vm.errors.password?.message}
              {...vm.register("password")}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[#E5E7EB]" />
                <span className="text-[13px] text-[#4A7A94]">
                  Se souvenir de moi
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[13px] text-[#2E8FAD] cursor-pointer hover:text-[#1B5E82] transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Button
              variant="primary"
              type="submit"
              loading={vm.isSubmitting}
              className="mt-1 w-full justify-center py-2.5 text-[14px]"
            >
              Se connecter
            </Button>
          </form>

          <p className="text-center text-[12.5px] text-[#8BAFC0] mt-5">
            Pas encore de compte ?{" "}
            <span className="text-[#2E8FAD] cursor-pointer hover:text-[#1B5E82] transition-colors">
              Créer un compte
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
