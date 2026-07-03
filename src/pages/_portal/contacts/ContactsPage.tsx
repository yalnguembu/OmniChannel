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
import { toast } from "sonner";
import { SegmentManagerModal } from "@/components/features/contacts/SegmentManagerModal";
import { ClientImportModal } from "@/components/features/contacts/ClientImportModal";

export function ContactsPage({ productId }: { productId?: string } = {}) {
  const vm = useContactViewModel(productId);

  const handleManageSegments = () => {
    if (vm.productId !== "all") vm.setIsSegmentsOpen(true);
    else toast.error("Sélectionnez d'abord un produit pour gérer les segments.");
  };

  // Ouvre la modale en mode création (comme l'onglet Contacts du produit).
  const handleNewContact = () => {
    vm.setEditingContact(null);
    vm.setIsModalOpen(true);
  };

  // L'import est rattaché à un produit : exiger une sélection de produit.
  const handleImport = () => {
    if (vm.productId === "all") {
      toast.error("Sélectionnez d'abord un produit pour importer des contacts.");
      return;
    }
    vm.setIsImportOpen(true);
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
        <div className="flex-1 flex flex-col  overflow-y-auto min-w-0 bg-white">
          {/* Toolbar */}
          <ContactHeader
            search={vm.search}
            onSearchChange={vm.setSearch}
            dateRange={vm.dateRange}
            onDateRangeChange={vm.setDateRange}
            onNewContact={handleNewContact}
            onImport={handleImport}
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
            email={vm.email}
            setEmail={vm.setEmail}
            firstName={vm.firstName}
            setFirstName={vm.setFirstName}
            lastName={vm.lastName}
            setLastName={vm.setLastName}
            postalCode={vm.postalCode}
            setPostalCode={vm.setPostalCode}
            ids={vm.ids}
            setIds={vm.setIds}
            onResetAdvanced={vm.resetAdvanced}
            segments={vm.segments}
            segmentId={vm.segmentId}
            setSegmentId={vm.setSegmentId}
            products={vm.products}
            productId={vm.productId}
            setProductId={vm.setProductId}
            hideProductFilter={vm.isProductLocked}
            onManageSegments={handleManageSegments}
          />

          {/* Table area */}
          <div className="flex-1 px-5 py-4">
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
                        onClick={handleNewContact}
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

      <ClientImportModal
        open={vm.isImportOpen && vm.productId !== "all"}
        onClose={() => vm.setIsImportOpen(false)}
        productId={vm.productId !== "all" ? vm.productId : ""}
        onSuccess={vm.handleImportSuccess}
      />
    </main>
  );
}
