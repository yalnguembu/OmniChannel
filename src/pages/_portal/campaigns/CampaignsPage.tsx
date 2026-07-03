import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ListFilterBar } from '@/components/features/shared/ListFilterBar'
import { PageLoader } from '@/components/feedback/PageLoader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Pagination } from '@/components/data-table/DataTable'
import { CampaignCard } from '@/components/features/campaigns/CampaignCard'
import { CampaignFormModal } from '@/components/features/campaigns/CampaignFormModal'
import { staggerContainer, cardItem } from '@/lib/animations'
import { useCampaignViewModel } from '@/hooks/useCampaignViewModel'

export function CampaignsPage({ productId }: { productId?: string } = {}) {
  const vm = useCampaignViewModel(productId)
  const f = vm.filters
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { create?: boolean }

  // Auto-open the creation modal when arrived here with ?create=1 (from a
  // product overview / segment), then strip the flag so a refresh won't reopen.
  useEffect(() => {
    if (search?.create && productId) {
      vm.handleOpenWizard()
      navigate({
        to: '/$productId/campaigns',
        params: { productId },
        search: {},
        replace: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search?.create])

  const statusOptions = [
    { value: 'all', label: 'Toutes', count: vm.counts?.all ?? 0 },
    { value: 'running', label: 'En cours', count: vm.counts?.running ?? 0 },
    { value: 'scheduled', label: 'Planifiées', count: vm.counts?.scheduled ?? 0 },
    { value: 'completed', label: 'Terminées', count: vm.counts?.completed ?? 0 },
    { value: 'draft', label: 'Brouillons', count: vm.counts?.draft ?? 0 },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8F9]/30">
      <ListFilterBar
        search={f.search}
        onSearchChange={f.setSearch}
        searchPlaceholder="Rechercher une campagne…"
        dateRange={f.dateRange}
        onDateRangeChange={f.setDateRange}
        statusOptions={statusOptions}
        currentStatus={f.status}
        onStatusChange={f.setStatus}
        advancedFields={vm.filterFields}
        advancedValues={f.advanced}
        advancedDefaults={f.advancedDefaults}
        onApplyAdvanced={f.applyAdvanced}
        isFilterModalOpen={f.isFilterModalOpen}
        setIsFilterModalOpen={f.setIsFilterModalOpen}
        actions={[
          {
            label: 'Nouvelle campagne',
            icon: <Plus size={13} strokeWidth={2.5} />,
            onClick: vm.handleOpenWizard,
          },
        ]}
      />

      <div className="flex-1 p-8 max-w-[1400px] w-full mx-auto">
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
                <Pagination total={vm.totalCount} pageSize={f.pageSize} page={f.page} onChange={f.setPage} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CampaignFormModal
        open={vm.formOpen}
        onClose={vm.handleCloseWizard}
        campaignId={vm.editingId}
        productId={productId}
      />
    </div>
  )
}
