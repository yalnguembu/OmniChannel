import React, { useState } from 'react'
import { Plus, Megaphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { PageLoader } from '@/components/feedback/PageLoader'
import { Pagination } from '@/components/data-table/DataTable'
import { CampaignCard } from '@/components/features/campaigns/CampaignCard'
import { StandardPageFilters } from '@/components/layout/StandardPageFilters'
import { staggerContainer } from '@/lib/animations'
import { useCampaignDraftStore } from '@/store/campaignDraftStore'
import { useProductCampaigns } from '@/hooks/useProductCampaigns'
import { useNavigate } from '@tanstack/react-router'

const CAMPAIGN_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'Actives' },
  { value: 'scheduled', label: 'Planifiées' },
  { value: 'completed', label: 'Terminées' },
]

interface CampaignsTabProps {
  productId: string
}

export function CampaignsTab({ productId }: CampaignsTabProps) {
  const vm = useProductCampaigns(productId);
  const navigate = useNavigate();
  const { resetDraft } = useCampaignDraftStore()

  const handleOpenWizard = () => {
    resetDraft()
    navigate({ to: '/campaigns/new', search: { productId } })
  }

  const handleEditCampaign = (id: string) => {
    navigate({ to: '/campaigns/$campaignId/edit', params: { campaignId: id } })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-2.5">
          <SearchInput
            placeholder="Rechercher une campagne..."
            value={vm.search}
            onChange={(e) => vm.handleSearch(e.target.value)}
            containerClassName="w-64"
          />
          <StandardPageFilters
            options={CAMPAIGN_FILTERS}
            currentFilter={vm.filter}
            onFilterChange={vm.handleFilter}
            className="mb-0"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetDraft();
            navigate({ to: '/campaigns/new', search: { productId } });
          }}
          className="px-6"
        >
          <Megaphone size={14} className="mr-1.5" /> Nouvelle Campagne
        </Button>
      </div>

      {vm.isLoading ? (
        <div className="py-20"><PageLoader /></div>
      ) : vm.campaigns.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F8F9] flex items-center justify-center mb-6">
            <Megaphone size={32} className="text-[#B8CDD8] opacity-50" />
          </div>
          <h3 className="text-[17px] font-bold text-[#0D2137]">Aucune campagne</h3>
          <p className="text-[13.5px] text-[#8BAFC0] mt-2 mb-8 max-w-[340px]">
            Ce produit ne possède aucune campagne correspondant à vos critères.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenWizard}>
            <Plus size={14} className="mr-2" /> Créer ma première campagne
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {vm.campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} onEdit={handleEditCampaign} />
            ))}
          </motion.div>
          
          <div className="flex justify-center pt-8 border-t border-[#F3F4F6]">
            <Pagination 
              total={vm.totalCount} 
              pageSize={vm.pageSize} 
              page={vm.page} 
              onChange={vm.setPage} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
