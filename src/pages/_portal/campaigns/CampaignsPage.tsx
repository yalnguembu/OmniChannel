import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardPageFilters } from '@/components/layout/StandardPageFilters'
import { PageLoader } from '@/components/feedback/PageLoader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Pagination } from '@/components/data-table/DataTable'
import { CampaignCard } from '@/components/features/campaigns/CampaignCard'
import { staggerContainer, cardItem } from '@/lib/animations'
import { useCampaignViewModel, type CampaignFilterType } from '@/hooks/useCampaignViewModel'

export function CampaignsPage() {
  const vm = useCampaignViewModel();

  const filterOptions: { value: CampaignFilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Toutes', count: vm.counts?.all ?? 0 },
    { value: 'active', label: 'Actifs', count: vm.counts?.active ?? 0 },
    { value: 'scheduled', label: 'Planifiées', count: vm.counts?.scheduled ?? 0 },
    { value: 'completed', label: 'Terminées', count: vm.counts?.completed ?? 0 },
    { value: 'draft', label: 'Brouillons', count: vm.counts?.draft ?? 0 },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#F7F8F9]/30">
      <StandardPageHeader
        title="Campagnes Marketing"
        subtitle={`${vm.totalCount} campagnes · ${vm.counts?.active ?? 0} actives`}
        searchValue={vm.search}
        onSearchChange={vm.handleSearch}
        searchPlaceholder="Rechercher une campagne..."
        actions={
          <Button variant="primary" size="sm" onClick={vm.handleOpenWizard} className="px-5">
            <Plus size={14} className="mr-1.5" /> Nouvelle campagne
          </Button>
        }
      />

      <StandardPageFilters
        options={filterOptions}
        currentFilter={vm.filter}
        onFilterChange={vm.handleFilter}
        totalFilteredCount={vm.campaigns.length}
        resultsLabel="campagnes"
      />

      <AnimatePresence mode="wait">
        {vm.isLoading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32">
            <PageLoader />
          </motion.div>
        ) : vm.campaigns.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#E5E7EB] rounded-[24px] p-24 text-center">
            <EmptyState
              title="Aucune campagne trouvée"
              description="Créez votre première campagne pour mobiliser votre audience."
              action={
                <Button variant="primary" size="sm" onClick={vm.handleOpenWizard} className="mt-4 px-6">
                   Lancer une campagne
                </Button>
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {vm.campaigns.map((c) => (
                  <CampaignCard 
                    key={c.id} 
                    campaign={c} 
                    onEdit={vm.handleEditCampaign} 
                    onDuplicate={vm.handleDuplicate}
                  />
                ))}
                
                {/* Create Card Alignment */}
                <motion.div
                  variants={cardItem}
                  layout
                  onClick={vm.handleOpenWizard}
                  className="bg-transparent border border-dashed border-[#E5E7EB] rounded-[20px] flex flex-col items-center justify-center gap-2 p-6 cursor-pointer hover:bg-white hover:border-[#2E8FAD]/30 transition-all min-h-[160px]"
                >
                  <Plus size={20} className="text-[#8BAFC0]" />
                  <p className="text-[13px] font-bold text-[#4A7A94]">Nouvelle</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center pb-12">
              <Pagination total={vm.totalCount} pageSize={vm.pageSize} page={vm.page} onChange={vm.setPage} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
