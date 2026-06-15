import { ContactTable } from "@/components/features/contacts/ContactTable";
import { ContactKPIs } from "@/components/features/contacts/ContactKPIs";
import { ContactHeader } from "@/components/features/contacts/ContactHeader";
import { ContactDetailPanel } from "@/components/features/contacts/ContactDetailPanel";
import { ContactModal } from "@/components/features/contacts/ContactModal";
import { ClientImportModal } from "@/components/features/contacts/ClientImportModal";
import { SegmentManagerModal } from "@/components/features/contacts/SegmentManagerModal";
import { useProductContacts } from "@/hooks/useProductContacts";

interface ContactsTabProps {
  productId: string;
}

export function ContactsTab({ productId }: ContactsTabProps) {
  const vm = useProductContacts(productId);

  const filterOptions = [
    { value: "all", label: "Tous", count: vm.totalCount },
    {
      value: "active",
      label: "Actifs",
      count: vm.contacts.filter((c) => c.status === "active").length,
    },
    {
      value: "inactive",
      label: "Inactifs",
      count: vm.contacts.filter((c) => c.status === "inactive").length,
    },
    {
      value: "blocked",
      label: "Bloqués",
      count: vm.contacts.filter((c) => c.status === "blocked").length,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white">
        <ContactHeader
          totalCount={vm.totalCount}
          search={vm.search}
          onSearchChange={vm.handleSearch}
          onNewContact={() => {
            vm.setEditingContact(null);
            vm.setIsModalOpen(true);
          }}
          onImport={() => vm.setIsImportOpen(true)}
          filterOptions={filterOptions}
          currentFilter={vm.statusFilter}
          onFilterChange={vm.setStatusFilter}
          sort={vm.sort}
          setSort={vm.setSort}
          sortOrder={vm.sortOrder}
          setSortOrder={vm.setSortOrder}
          pageSize={vm.pageSize}
          setPageSize={vm.setPageSize}
          segments={vm.segments}
          segmentId={vm.segmentId}
          setSegmentId={vm.setSegmentId}
          onManageSegments={() => vm.setIsSegmentsOpen(true)}
          inlineFilters
          hideProductFilter
        />

        <div className="px-5 py-4 space-y-4">
          <ContactKPIs
            total={vm.totalCount}
            activeCount={
              vm.contacts.filter((c) => c.status === "active").length
            }
            inactiveCount={
              vm.contacts.filter((c) => c.status === "inactive").length
            }
            blockedCount={
              vm.contacts.filter((c) => c.status === "blocked").length
            }
          />

          <ContactTable
            contacts={vm.contacts}
            loading={vm.isLoading}
            onView={vm.handleView}
            onEdit={vm.handleEdit}
            onDelete={vm.handleDelete}
            activeRowId={vm.activeContact?.id}
            pagination={{
              page: vm.page,
              pageSize: vm.pageSize,
              total: vm.totalCount,
              onPageChange: vm.setPage,
            }}
          />
        </div>
      </div>

      {/* Detail side panel — same as the global contacts list, with all actions */}
      <ContactDetailPanel
        contact={vm.activeContact}
        activeTab={vm.detailTab}
        onTabChange={vm.setDetailTab}
        onClose={() => vm.setActiveContact(null)}
        onEdit={vm.handleEdit}
        onDelete={vm.handleDelete}
      />

      {/* Modals */}
      <ContactModal
        open={vm.isModalOpen}
        onClose={() => {
          vm.setIsModalOpen(false);
          vm.setEditingContact(null);
        }}
        editing={vm.editingContact}
        onSubmit={vm.handleSubmit}
        loading={vm.isActionPending}
        productId={productId}
      />

      <ClientImportModal
        open={vm.isImportOpen}
        onClose={() => vm.setIsImportOpen(false)}
        productId={productId}
        onSuccess={vm.handleImportSuccess}
      />

      <SegmentManagerModal
        open={vm.isSegmentsOpen}
        onClose={() => vm.setIsSegmentsOpen(false)}
        productId={productId}
      />
    </div>
  );
}
