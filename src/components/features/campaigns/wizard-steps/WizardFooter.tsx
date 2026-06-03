import React from "react";
import { Button } from "@/components/ui/Button";

export function WizardFooter({
  step,
  totalSteps,
  onClose,
  onPrevious,
  onNext,
  isNextLoading,
  onFinalize,
  isFinalizeLoading,
}: {
  step: number;
  totalSteps: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isNextLoading: boolean;
  onFinalize: () => void;
  isFinalizeLoading: boolean;
}) {
  return (
    <footer className="px-8 py-6 bg-white border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
      <Button
        variant="secondary"
        size="md"
        onClick={onPrevious}
        disabled={step === 0}
        className="px-8 font-bold border-[#E5E7EB]"
      >
        Précédent
      </Button>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="md"
          onClick={onClose}
          className="font-bold text-[#8BAFC0]"
        >
          Annuler
        </Button>
        {step === totalSteps - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={onFinalize}
            loading={isFinalizeLoading}
            className="px-10 font-bold shadow-lg shadow-[#0D2137]/10"
          >
            Lancer la campagne
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            loading={isNextLoading}
            className="px-10 font-bold shadow-lg shadow-[#0D2137]/10"
          >
            Continuer
          </Button>
        )}
      </div>
    </footer>
  );
}
