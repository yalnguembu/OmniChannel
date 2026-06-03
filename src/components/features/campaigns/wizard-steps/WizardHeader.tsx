import React from "react";
import { Check, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const wizardSteps = [
  { label: "Infos générales", sub: "Nom & type" },
  { label: "Canaux", sub: "Sélection & templates" },
  { label: "Ciblage", sub: "Segments & audience" },
  { label: "Séquence", sub: "Étapes d'envoi" },
  { label: "Planification", sub: "Date & fréquence" },
  { label: "Confirmation", sub: "Lancement" },
];

export function WizardHeader({
  draftId,
  step,
  setStep,
  onClose,
}: {
  draftId?: string;
  step: number;
  setStep: (s: number) => void;
  onClose: () => void;
}) {
  return (
    <header className="px-8 py-6 bg-white border-b border-[#E5E7EB] shadow-sm shrink-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-[#0D2137] tracking-tight">
            {draftId ? "Modification" : "Nouvelle campagne"}
          </h1>
          <p className="text-[13px] text-[#8BAFC0] mt-0.5">
            Configurez votre stratégie de diffusion multicanale
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#8BAFC0] transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <nav className="flex items-center gap-1">
        {wizardSteps.map((s, i) => (
          <React.Fragment key={i}>
            <div
              className={cn(
                "flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-lg transition-all",
                i <= step ? "opacity-100" : "opacity-40 pointer-events-none",
              )}
              onClick={() => i < step && setStep(i)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                  i < step
                    ? "bg-[#2E8FAD] text-white shadow-md shadow-[#2E8FAD]/20"
                    : i === step
                      ? "bg-[#0D2137] text-white"
                      : "bg-[#F0F2F4] text-[#8BAFC0]",
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <div className="hidden lg:block">
                <p
                  className={cn(
                    "text-[13px] font-bold transition-colors",
                    i === step ? "text-[#0D2137]" : "text-[#8BAFC0]",
                  )}
                >
                  {s.label}
                </p>
                <p className="text-[10px] text-[#B8CDD8] font-bold uppercase tracking-wider">
                  {s.sub}
                </p>
              </div>
            </div>
            {i < wizardSteps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-4 rounded-full",
                  i < step ? "bg-[#2E8FAD]" : "bg-[#E5E7EB]",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </nav>
    </header>
  );
}
