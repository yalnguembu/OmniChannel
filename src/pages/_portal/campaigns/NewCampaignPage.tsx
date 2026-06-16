import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CampaignWizard } from '@/components/features/campaigns/CampaignWizard'
import { useCampaignDraftStore } from '@/store/campaignDraftStore'

export function NewCampaignPage({productId}:{productId?: string}) {
  const navigate = useNavigate()
  const resetDraft = useCampaignDraftStore(s => s.resetDraft)

  const handleClose = () => {
    resetDraft()
    // Navigate back to the campaigns list or the product page if provided
    if (productId) {
      navigate({ to: '/$productId/campaigns', params: { productId } })
    } else {
      navigate({ to: '/dashboard' })
    }
  }

  return (
    <div className="h-screen bg-white">
      <CampaignWizard 
        onClose={handleClose} 
        productId={productId} 
      />
    </div>
  )
}
