import React from "react";
import { Check, ChevronLeft, X } from "lucide-react";
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
  const total = wizardSteps.length;
  const current = wizardSteps[step] ?? wizardSteps[0];

  return (
    <>
      {/* ===== Desktop (lg+) : vertical stepper rail ===== */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 shrink-0 border-r border-[#E5E7EB] bg-[#F7F8F9] px-6 py-7 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-[18px] font-semibold text-[#0D2137] tracking-tight">
            {draftId ? "Modification" : "Nouvelle campagne"}
          </h1>
          <p className="text-[12.5px] text-[#8BAFC0] mt-1 leading-relaxed">
            Configurez votre stratégie de diffusion multicanale
          </p>
        </div>

        <nav className="flex flex-col">
          {wizardSteps.map((s, i) => (
            <React.Fragment key={i}>
              <div
                className={cn(
                  "flex items-center gap-3 cursor-pointer group transition-all",
                  i <= step ? "opacity-100" : "opacity-40 pointer-events-none",
                )}
                onClick={() => i < step && setStep(i)}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-all shrink-0",
                    i < step
                      ? "bg-[#2E8FAD] text-white"
                      : i === step
                        ? "bg-[#0D2137] text-white"
                        : "bg-white border border-[#E5E7EB] text-[#8BAFC0]",
                  )}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <p
                  className={cn(
                    "text-[13px] font-medium transition-colors",
                    i === step ? "text-[#0D2137]" : "text-[#6f96a7]",
                  )}
                >
                  {s.label}
                </p>
              </div>
              {i < total - 1 && (
                <div
                  className={cn(
                    "w-[2px] h-5 ml-[15px] my-1 rounded-full transition-all",
                    i < step ? "bg-[#2E8FAD]" : "bg-[#E5E7EB]",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </nav>
      </aside>

      {/* ===== Mobile (<lg) : condensed top bar ===== */}
      <header className="lg:hidden px-4 py-3 bg-white border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#0D2137] transition-all shrink-0"
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0 text-center px-1">
            <p className="text-[14px] font-semibold text-[#0D2137] truncate">
              {current.label}
            </p>
            <p className="text-[11px] text-[#8BAFC0]">
              Étape {step + 1} sur {total}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#8BAFC0] transition-all shrink-0"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-3 h-[3px] bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E8FAD] rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </header>
    </>
  );
}
