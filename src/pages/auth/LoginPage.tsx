import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLoginViewModel } from "@/hooks/useLoginViewModel";

export function LoginPage() {
  const vm = useLoginViewModel();

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[400px]"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-[11px] bg-[#0D2137] flex items-center justify-center shadow-[0_4px_12px_rgba(13,33,55,0.2)]">
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <circle
                cx="9"
                cy="9"
                r="3.2"
                stroke="#6AB8D4"
                strokeWidth="1.3"
              />
              <path
                d="M9 2v2M9 14v2M2 9h2M14 9h2M3.93 3.93l1.41 1.41M12.66 12.66l1.41 1.41M3.93 14.07l1.41-1.41M12.66 5.34l1.41-1.41"
                stroke="#E8541A"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            OmniChannel
          </span>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(13,33,55,0.08)] border border-[#E5E7EB]/60 p-8">
          <h1 className="text-[22px] font-semibold text-[#0D2137] tracking-tight mb-1">
            Connexion
          </h1>
          <p className="text-[13px] text-[#4A7A94] mb-7">
            Accédez à votre espace OmniChannel
          </p>

          <form
            onSubmit={vm.handleSubmit}
            className="flex flex-col gap-4"
          >
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
              <span className="text-[13px] text-[#2E8FAD] cursor-pointer hover:text-[#1B5E82] transition-colors">
                Mot de passe oublié ?
              </span>
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
