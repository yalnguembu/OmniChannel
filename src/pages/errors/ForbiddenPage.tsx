import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** 403 — rendered when a route's permission guard redirects to `/forbidden`. */
export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F5F6] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#FEE2E2] text-[#DC2626]">
        <ShieldAlert size={30} />
      </div>
      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#DC2626]">
        Erreur 403
      </p>
      <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[#0D2137]">
        Accès refusé
      </h1>
      <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-[#4A7A94]">
        Vous n'avez pas les autorisations nécessaires pour consulter cette page.
        Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
      </p>
      <div className="mt-6">
        <Button variant="primary" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft size={14} /> Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
