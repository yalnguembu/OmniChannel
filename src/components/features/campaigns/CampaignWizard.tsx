import React from "react";
import { Loader2 } from "lucide-react";
import { TemplateModal } from "@/components/features/templates/TemplateModal";
import { SegmentManagerModal } from "@/components/features/contacts/SegmentManagerModal";
import { WizardHeader } from "./wizard-steps/WizardHeader";
import { WizardFooter } from "./wizard-steps/WizardFooter";
import { StepGeneral } from "./wizard-steps/StepGeneral";
import { StepChannels } from "./wizard-steps/StepChannels";
import { StepTargeting } from "./wizard-steps/StepTargeting";
import { StepSequence } from "./wizard-steps/StepSequence";
import { StepScheduling } from "./wizard-steps/StepScheduling";
import { StepConfirmation } from "./wizard-steps/StepConfirmation";
import { useCampaignWizard } from "@/hooks/useCampaignWizard";

interface CampaignWizardProps {
  onClose: () => void;
  productId?: string;
}

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

      {/* Content column : scrollable steps + footer */}
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
              <StepChannels
                draft={wizard.draft}
                updateDraft={wizard.updateDraft}
                channels={wizard.channels}
                configuringChannelId={wizard.configuringChannelId}
                setConfiguringChannelId={wizard.setConfiguringChannelId}
                templates={wizard.templates}
                templatesLoading={wizard.templatesLoading}
                syncChannelMutation={wizard.syncChannelMutation}
                setShowNewTemplateModal={wizard.setShowNewTemplateModal}
              />
            )}

            {wizard.step === 2 && (
              <StepTargeting
                draft={wizard.draft}
                updateDraft={wizard.updateDraft}
                segments={wizard.segments}
                setShowSegmentModal={wizard.setShowSegmentModal}
              />
            )}

            {wizard.step === 3 && (
              <StepSequence
                campaignId={wizard.draft.id}
                channels={wizard.channels}
                templates={wizard.templates}
                templatesLoading={wizard.templatesLoading}
              />
            )}

            {wizard.step === 4 && (
              <StepScheduling
                draft={wizard.draft}
                updateDraft={wizard.updateDraft}
              />
            )}

            {wizard.step === 5 && <StepConfirmation draft={wizard.draft} />}
          </div>
        </main>

        <WizardFooter
          step={wizard.step}
          totalSteps={6}
          onClose={onClose}
          onPrevious={() => wizard.setStep(wizard.step - 1)}
          onNext={wizard.handleNext}
          isNextLoading={wizard.persistBaseMutation.isPending}
          onFinalize={() => wizard.finalizeMutation.mutate()}
          isFinalizeLoading={wizard.finalizeMutation.isPending}
        />
      </div>

      {/* Standard Template Modal */}
      <TemplateModal
        products={[]}
        open={wizard.showNewTemplateModal}
        onClose={() => wizard.setShowNewTemplateModal(false)}
        editing={null}
        onSubmit={(data) =>
          wizard.createTemplateMutation.mutate({
            body: {
              productId: data.productId,
              name: data.name,
              description: data.description,
              status: data.status,
              category: data.category,
              defaultLanguage: data.language,
              version: data.version,
            },
          })
        }
        loading={wizard.createTemplateMutation.isPending}
      />

      {/* Segment Manager Modal */}
      <SegmentManagerModal
        open={wizard.showSegmentModal}
        onClose={() => wizard.setShowSegmentModal(false)}
        productId={wizard.activeProductId || ""}
      />
    </div>
  );
}
