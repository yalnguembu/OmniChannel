import { create } from 'zustand'

interface CampaignDraft {
  id?: string
  name?: string
  productId?: string
  type?: string
  description?: string
  channelIds?: string[]
  templateIds?: Record<string, string>
  segmentIds?: string[]
  priorities?: Record<string, number>
  sendType?: 'immediate' | 'scheduled' | 'recurring' | 'triggered'
  scheduledAt?: string
  timezone?: string
}

interface CampaignDraftState {
  draft: CampaignDraft
  step: number
  setStep: (step: number) => void
  updateDraft: (data: Partial<CampaignDraft>) => void
  resetDraft: () => void
}

const initial: CampaignDraft = {}

export const useCampaignDraftStore = create<CampaignDraftState>((set) => ({
  draft: initial,
  step: 0,
  setStep: (step) => set({ step }),
  updateDraft: (data) => set((s) => ({ draft: { ...s.draft, ...data } })),
  resetDraft: () => set({ draft: initial, step: 0 }),
}))
