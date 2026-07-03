import { create } from 'zustand'

/**
 * Draft for the campaign creation wizard. Channels/segments were removed from
 * the contract (targeting now lives in step configJson), so the draft only
 * carries the campaign's own fields + cron scheduling. Steps are persisted
 * server-side once the campaign exists.
 */
interface CampaignDraft {
  id?: string
  name?: string
  productId?: string
  description?: string
  isRecurring?: boolean
  cronExpression?: string
}

interface CampaignDraftState {
  draft: CampaignDraft
  updateDraft: (data: Partial<CampaignDraft>) => void
  resetDraft: () => void
}

const initial: CampaignDraft = {}

export const useCampaignDraftStore = create<CampaignDraftState>((set) => ({
  draft: initial,
  updateDraft: (data) => set((s) => ({ draft: { ...s.draft, ...data } })),
  resetDraft: () => set({ draft: initial }),
}))
