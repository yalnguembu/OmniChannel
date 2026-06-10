import { useNavigate } from "@tanstack/react-router";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** 404 — wired as the router's defaultNotFoundComponent for unmatched paths. */
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F5F6] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#E8F4F8] text-[#2E8FAD]">
        <Compass size={30} />
      </div>
      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2E8FAD]">
        Erreur 404
      </p>
      <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[#0D2137]">
        Page introuvable
      </h1>
      <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-[#4A7A94]">
        La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez
        l'adresse ou revenez à l'accueil.
      </p>
      <div className="mt-6">
        <Button variant="primary" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft size={14} /> Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
