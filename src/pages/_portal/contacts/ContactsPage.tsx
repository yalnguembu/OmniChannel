import { motion, AnimatePresence } from "framer-motion";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ContactTable } from "@/components/features/contacts/ContactTable";
import { ContactModal } from "@/components/features/contacts/ContactModal";
import { ContactHeader } from "@/components/features/contacts/ContactHeader";
import { ContactDetailPanel } from "@/components/features/contacts/ContactDetailPanel";
import { staggerContainer } from "@/lib/animations";
import { useContactViewModel } from "@/hooks/useContactViewModel";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "@tanstack/react-router";
import { SegmentManagerModal } from "@/components/features/contacts/SegmentManagerModal";

export function ContactsPage() {
  const vm = useContactViewModel();
  const navigate = useNavigate();

  const handleManageSegments = () => {
    if (vm.productId !== "all") vm.setIsSegmentsOpen(true);
    else navigate({ to: "/contacts/segments" });
  };

  const filterOptions = [
    { value: "all", label: "Tous", count: vm.counts.all },
    { value: "active", label: "Actifs", count: vm.counts.active },
    { value: "inactive", label: "Inactifs", count: vm.counts.inactive },
    { value: "blocked", label: "Bloqués", count: vm.counts.blocked },
  ];

  const optInPct = vm.counts.all > 0 ? 94.6 : 0;
  const activePct =
    vm.counts.all > 0 ? Math.round((vm.counts.active / vm.counts.all) * 100) : 0;

  return (
    <main className="flex flex-col h-screen overflow-hidden font-sans bg-[#F4F5F6]">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-2.5 p-4 px-5 bg-white border-b border-[#E5E7EB] shrink-0">
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-md border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Total contacts
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                {vm.counts.all.toLocaleString("fr")}
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#16A34A]">
                <ArrowUpRight size={11} strokeWidth={2.5} /> +312 ce mois
              </div>
            </div>
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-md border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Actifs (30j)
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                {vm.counts.active.toLocaleString("fr")}
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#8BAFC0]">
                <Minus size={11} strokeWidth={2.5} /> {activePct}% du total
              </div>
            </div>
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-md border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Opt-in SMS
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                7 890
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#16A34A]">
                <ArrowUpRight size={11} strokeWidth={2.5} /> {optInPct}% du total
              </div>
            </div>
            <div className="p-3 px-3.5 bg-[#F7F8F9] rounded-md border border-[#E5E7EB]">
              <div className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
                Inactifs (30j)
              </div>
              <div className="text-[20px] font-semibold text-[#0D2137] tracking-[-0.025em] leading-none">
                {vm.counts.inactive.toLocaleString("fr")}
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-[3px] text-[#DC2626]">
                <ArrowDownRight size={11} strokeWidth={2.5} /> À réactiver
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <ContactHeader
            totalCount={vm.totalCount}
            search={vm.search}
            onSearchChange={vm.setSearch}
            onNewContact={() => vm.setIsModalOpen(true)}
            filterOptions={filterOptions}
            currentFilter={vm.statusFilter}
            onFilterChange={vm.setStatusFilter}
            isFilterModalOpen={vm.isFilterModalOpen}
            setIsFilterModalOpen={vm.setIsFilterModalOpen}
            sort={vm.sort}
            setSort={vm.setSort}
            sortOrder={vm.sortOrder}
            setSortOrder={vm.setSortOrder}
            pageSize={vm.pageSize}
            setPageSize={vm.setPageSize}
            segments={vm.segments}
            segmentId={vm.segmentId}
            setSegmentId={vm.setSegmentId}
            products={vm.products}
            productId={vm.productId}
            setProductId={vm.setProductId}
            onManageSegments={handleManageSegments}
          />

          {/* Table area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimatePresence mode="wait">
              {vm.isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24"
                >
                  <PageLoader />
                </motion.div>
              ) : vm.contacts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-[#E5E7EB] rounded-[24px] p-24 text-center"
                >
                  <EmptyState
                    title="Aucun contact trouvé"
                    description="Importez vos contacts ou ajoutez-les manuellement pour commencer."
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => vm.setIsModalOpen(true)}
                        className="mt-4 px-6"
                      >
                        Ajouter un contact
                      </Button>
                    }
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-6 pb-6"
                >
                  <ContactTable
                    contacts={vm.contacts}
                    loading={vm.isLoading}
                    onView={(c) => vm.setActiveContact(c)}
                    onEdit={(c) => vm.handleEdit(c)}
                    onDelete={vm.handleDelete}
                    activeRowId={vm.activeContact?.id}
                    pagination={{
                      page: vm.page,
                      pageSize: vm.pageSize,
                      total: vm.totalCount,
                      onPageChange: vm.setPage,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ContactDetailPanel
          contact={vm.activeContact}
          activeTab={vm.detailTab}
          onTabChange={vm.setDetailTab}
          onClose={() => vm.setActiveContact(null)}
          onEdit={(c) => vm.handleEdit(c)}
          onDelete={vm.handleDelete}
        />
      </div>

      <ContactModal
        open={vm.isModalOpen}
        onClose={() => {
          vm.setIsModalOpen(false);
          vm.setEditingContact(null);
        }}
        editing={vm.editingContact}
        onSubmit={vm.handleSubmit}
        loading={vm.isActionPending}
        productId={vm.productId !== "all" ? vm.productId : undefined}
      />

      <SegmentManagerModal
        open={vm.isSegmentsOpen && vm.productId !== "all"}
        onClose={() => vm.setIsSegmentsOpen(false)}
        productId={vm.productId !== "all" ? vm.productId : ""}
      />
    </main>
  );
}
