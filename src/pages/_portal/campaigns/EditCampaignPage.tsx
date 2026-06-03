import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CampaignWizard } from "@/components/features/campaigns/CampaignWizard";
import { useCampaignDraftStore } from "@/store/campaignDraftStore";

export function EditCampaignPage({campaignId}:{campaignId: string}) {
  const navigate = useNavigate();
  const { updateDraft, resetDraft } = useCampaignDraftStore();

  useEffect(() => {
    // Set the draft ID immediately to trigger loading in the Wizard
    updateDraft({ id: campaignId });
  }, [campaignId, updateDraft]);

  const handleClose = () => {
    resetDraft();
    // Navigate back to the campaign detail page
    navigate({ to: "/campaigns/$campaignId", params: { campaignId } });
  };

  return (
    <div className="h-screen bg-white">
      <CampaignWizard onClose={handleClose} />
    </div>
  );
}
