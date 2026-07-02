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
    <footer className="px-4 lg:px-6 py-3 lg:py-4 bg-white border-t border-[#E5E7EB] flex items-center justify-between gap-3 shrink-0">
      {/* Précédent — desktop only (mobile uses the header back chevron) */}
      <div className="hidden lg:block">
        <Button
          variant="secondary"
          size="md"
          onClick={onPrevious}
          disabled={step === 0}
          className="px-6 font-medium border-[#E5E7EB]"
        >
          Précédent
        </Button>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto">
        {/* Annuler — desktop only (mobile uses the header close button) */}
        <div className="hidden lg:block">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="font-medium text-[#8BAFC0]"
          >
            Annuler
          </Button>
        </div>
        {step === totalSteps - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={onFinalize}
            loading={isFinalizeLoading}
            className="w-full lg:w-auto px-8 font-medium"
          >
            Enregistrer
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            loading={isNextLoading}
            className="w-full lg:w-auto px-8 font-medium"
          >
            Continuer
          </Button>
        )}
      </div>
    </footer>
  );
}
