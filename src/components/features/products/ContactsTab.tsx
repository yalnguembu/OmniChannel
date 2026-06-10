import { Plus, Upload, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StandardPageFilters } from "@/components/layout/StandardPageFilters";
import { ContactTable } from "@/components/features/contacts/ContactTable";
import { ContactKPIs } from "@/components/features/contacts/ContactKPIs";
import { ContactModal } from "@/components/features/contacts/ContactModal";
import { ClientImportModal } from "@/components/features/contacts/ClientImportModal";
import { SegmentManagerModal } from "@/components/features/contacts/SegmentManagerModal";
import { useProductContacts } from "@/hooks/useProductContacts";

const CONTACT_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Inactifs" },
  { value: "blocked", label: "Bloqués" },
];

interface ContactsTabProps {
  productId: string;
}

// Contact list for a product. Attribute schema + import mapping are configured on
// the dedicated product "Attributs" tab (SchemaTab + useProductAttributeSchema),
// not here — this tab is the contact list only.
export function ContactsTab({ productId }: ContactsTabProps) {
  const vm = useProductContacts(productId);

  return (
    <div className="space-y-6">
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* List Headers & Filters - Flat 2.0 */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <SearchInput
              placeholder="Rechercher..."
              value={vm.search}
              onChange={(e) => vm.handleSearch(e.target.value)}
              containerClassName="w-56"
            />
            <StandardPageFilters
              options={CONTACT_FILTERS}
              currentFilter={vm.statusFilter}
              onFilterChange={vm.setStatusFilter}
              className="mb-0"
            />

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-[8px]">
              <Filter size={12} className="text-[#8BAFC0]" />
              <select
                value={vm.segmentId}
                onChange={(e) => vm.setSegmentId(e.target.value)}
                className="text-[11.5px] bg-transparent outline-none text-[#4A7A94] font-medium cursor-pointer"
              >
                <option value="all">Ségments (Tous)</option>
                {vm.segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => vm.setIsSegmentsOpen(true)}
              className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:text-[#0D2137] hover:border-[#2E8FAD] transition-all cursor-pointer"
              title="Gérer les ségments"
            >
              <Settings size={12} />
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => vm.setIsImportOpen(true)}
            >
              <Upload size={13} className="mr-1" /> Importer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                vm.setEditingContact(null);
                vm.setIsModalOpen(true);
              }}
            >
              <Plus size={13} className="mr-1" /> Nouveau contact
            </Button>
          </div>
        </div>

        <ContactKPIs
          total={vm.totalCount}
          activeCount={vm.contacts.filter((c) => c.status === "active").length}
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
          pagination={{
            page: vm.page,
            pageSize: 15,
            total: vm.totalCount,
            onPageChange: vm.setPage,
          }}
        />
      </div>

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
