import React from "react";
import {
  Plus,
  Search,
  Upload,
  Save,
  Filter,
  Settings,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StandardPageFilters } from "@/components/layout/StandardPageFilters";
import { Pagination } from "@/components/data-table/DataTable";
import { ContactTable } from "@/components/features/contacts/ContactTable";
import { ContactKPIs } from "@/components/features/contacts/ContactKPIs";
import { ContactModal } from "@/components/features/contacts/ContactModal";
import { ClientImportModal } from "@/components/features/contacts/ClientImportModal";
import { SegmentManagerModal } from "@/components/features/contacts/SegmentManagerModal";
import { AttributeManager } from "./AttributeManager";
import { MappingManager } from "./MappingManager";
import { cn } from "@/lib/utils";
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

export function ContactsTab({ productId }: ContactsTabProps) {
  const vm = useProductContacts(productId);

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation - Flat 2.0 Style */}
      <div className="flex bg-[#E8F4F8]/50 p-1 rounded-[10px] w-fit border border-[#2E8FAD]/10 mb-2">
        <button
          onClick={() => vm.setActiveSubTab("list")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-all cursor-pointer",
            vm.activeSubTab === "list"
              ? "bg-white text-[#1B5E82] ring-1 ring-black/5"
              : "text-[#4A7A94] hover:text-[#0D2137]",
          )}
        >
          <List size={13} /> Liste
        </button>
        <button
          onClick={() => vm.setActiveSubTab("configs")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-all cursor-pointer",
            vm.activeSubTab === "configs"
              ? "bg-white text-[#1B5E82] ring-1 ring-black/5"
              : "text-[#4A7A94] hover:text-[#0D2137]",
          )}
        >
          <SlidersHorizontal size={13} /> Configurations
        </button>
      </div>

      {vm.activeSubTab === "list" ? (
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
              pagination={{
                page: vm.page,
                pageSize: 15,
                total: vm.totalCount,
                onPageChange: vm.setPage,
              }}
            />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-8 space-y-10">
            {vm.configData ? (
              <>
                <AttributeManager
                  attributes={vm.configData.clientAttributes}
                  onChange={(attrs) =>
                    vm.setConfigData({
                      ...vm.configData!,
                      clientAttributes: attrs,
                    })
                  }
                />

                <div className="pt-8 border-t border-[#E5E7EB]">
                  <MappingManager
                    attributes={vm.configData.clientAttributes}
                    mappings={vm.configData.clientMappingConfiguration}
                    onChange={(maps) =>
                      vm.setConfigData({
                        ...vm.configData!,
                        clientMappingConfiguration: maps,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    onClick={vm.handleSaveConfigs}
                    loading={vm.isActionPending}
                    className="gap-2 shadow-sm hover:shadow-md transition-all px-8"
                  >
                    <Save size={16} /> Sauvegarder les configurations
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-[#8BAFC0]">
                Chargement des configurations...
              </div>
            )}
          </div>
        </div>
      )}

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
