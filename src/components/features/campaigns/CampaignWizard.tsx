import { Loader2 } from "lucide-react";
import { WizardHeader } from "./wizard-steps/WizardHeader";
import { WizardFooter } from "./wizard-steps/WizardFooter";
import { StepGeneral } from "./wizard-steps/StepGeneral";
import { StepScheduling } from "./wizard-steps/StepScheduling";
import { StepConfirmation } from "./wizard-steps/StepConfirmation";
import { useCampaignWizard } from "@/hooks/useCampaignWizard";

interface CampaignWizardProps {
  onClose: () => void;
  productId?: string;
}

const TOTAL_STEPS = 3;

export function CampaignWizard({ onClose, productId }: CampaignWizardProps) {
  const wizard = useCampaignWizard({ productId, onClose });

  if (wizard.loadingInitial)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2E8FAD]" size={40} />
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-white overflow-hidden">
      <WizardHeader
        draftId={wizard.draft.id}
        step={wizard.step}
        setStep={wizard.setStep}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-custom">
          <div className="w-full max-w-6xl mx-auto pb-12">
            {wizard.step === 0 && (
              <StepGeneral
                draft={wizard.draft}
                updateDraft={wizard.updateDraft}
                dropdownProducts={wizard.dropdownProducts}
                productId={productId}
              />
            )}
            {wizard.step === 1 && (
              <StepScheduling draft={wizard.draft} updateDraft={wizard.updateDraft} />
            )}
            {wizard.step === 2 && <StepConfirmation draft={wizard.draft} />}
          </div>
        </main>

        <WizardFooter
          step={wizard.step}
          totalSteps={TOTAL_STEPS}
          onClose={onClose}
          onPrevious={() => wizard.setStep(wizard.step - 1)}
          onNext={wizard.handleNext}
          isNextLoading={false}
          onFinalize={wizard.handleFinish}
          isFinalizeLoading={wizard.isSaving}
        />
      </div>
    </div>
  );
}
