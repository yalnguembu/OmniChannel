import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, FileText, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/data-table/DataTable";
import { TemplateList } from "@/components/features/templates/TemplateList";
import { TemplateDetail } from "@/components/features/templates/TemplateDetail";
import { TemplateModal } from "@/components/features/templates/TemplateModal";
import { TemplateVariantModal } from "@/components/features/templates/TemplateVariantModal";
import { TemplateImportModal } from "@/components/features/templates/TemplateImportModal";
import { useTemplateViewModel } from "@/hooks/useTemplateViewModel";
import { cn } from "@/lib/utils";

const CHANNEL_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "sms", label: "SMS" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
] as const;

type ChannelFilter = (typeof CHANNEL_FILTERS)[number]["key"];

export function TemplatesPage() {
  const vm = useTemplateViewModel();
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [variantChannelId, setVariantChannelId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const filteredTemplates = vm.templates.filter((t) => {
    if (channelFilter === "all") return true;
    return true; // Channel filter would need channel data on template — show all for now
  });

  return (
    <div className="flex h-full overflow-hidden bg-[#F4F5F6]">
      {/* ── LEFT PANEL: List & Search ── */}
      <div className="w-[340px] border-r border-[#E5E7EB] bg-white flex flex-col shrink-0">

        {/* Header */}
        <div className="px-4 py-4 border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[15px] font-semibold text-[#0D2137] tracking-tight">
              {vm.totalCount} template{vm.totalCount !== 1 ? "s" : ""}
            </p>
            {/* Import WhatsApp templates from Meta */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImportOpen(true)}
              title="Importer les templates depuis WhatsApp Business"
            >
              <Download size={13} />
              Import WA
            </Button>
          </div>

          {/* Search */}
          <div className="mb-2.5">
            <SearchInput
              placeholder="Rechercher un template…"
              value={vm.search}
              onChange={(e) => vm.handleSearch(e.target.value)}
              containerClassName="w-full"
            />
          </div>

          {/* Channel filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {CHANNEL_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setChannelFilter(key)}
                className={cn(
                  "text-[11.5px] px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap",
                  channelFilter === key
                    ? "bg-[#0D2137] text-white border-[#0D2137] font-medium"
                    : "bg-none text-[#4A7A94] border-[#E5E7EB] hover:bg-[#F0F2F4]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {vm.isLoading ? (
            <PageLoader />
          ) : filteredTemplates.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<FileText size={28} className="text-[#8BAFC0]" />}
                title="Aucun template trouvé"
              />
            </div>
          ) : (
            <TemplateList
              templates={filteredTemplates}
              activeId={vm.activeTemplate?.id}
              onSelect={vm.handleSelectTemplate}
              onEdit={vm.handleOpenEditModal}
            />
          )}
        </div>

        {/* Footer: pagination + new button */}
        <div className="shrink-0 border-t border-[#E5E7EB]">
          <div className="px-3 py-2">
            <Pagination
              total={vm.totalCount}
              pageSize={30}
              page={vm.page}
              onChange={vm.setPage}
            />
          </div>
          <div className="px-2 pb-2">
            <button
              onClick={vm.handleOpenCreateModal}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-md border border-dashed border-[#E5E7EB] bg-none text-[13px] text-[#4A7A94] cursor-pointer transition-all hover:bg-white hover:border-[#6AB8D4] hover:border-solid hover:text-[#1B5E82]"
            >
              <Plus size={15} />
              Nouveau template
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Detail / Editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {vm.activeTemplate ? (
          <TemplateDetail
            template={vm.activeTemplate}
            tplChannels={vm.templateChannels}
            channels={vm.channels}
            onEdit={vm.handleOpenEditModal}
            onDuplicate={vm.handleDuplicate}
            onDelete={vm.handleConfirmDelete}
            onToggleChannel={vm.handleToggleChannel}
            onSave={vm.handleInlineSave}
            onEditVariant={setVariantChannelId}
            isSaving={vm.isUpdateLoading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#F4F5F6]">
            <EmptyState
              icon={<Eye size={40} className="text-[#B8CDD8]" />}
              title="Sélectionnez un template"
              description="Choisissez un template dans la liste pour voir les détails, modifier le contenu ou gérer les canaux."
            />
          </div>
        )}
      </div>

      {/* Creation/Edition Modal */}
      <TemplateModal
        open={vm.isModalOpen}
        onClose={vm.handleCloseModal}
        editing={vm.editingTemplate}
        onSubmit={vm.handleSubmit}
        loading={vm.isActionLoading}
        products={vm.products}
      />

      {/* Template Channel Variant editor */}
      <TemplateVariantModal
        open={!!variantChannelId}
        onClose={() => setVariantChannelId(null)}
        templateChannelId={variantChannelId}
      />

      {/* WhatsApp import modal */}
      <TemplateImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {vm.deleteTarget && (
          <Modal
            open={!!vm.deleteTarget}
            onClose={vm.handleCancelDelete}
            title="Supprimer le template"
            size="sm"
            footer={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={vm.handleCancelDelete}>
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={vm.handleDelete}
                  loading={vm.isActionLoading}
                >
                  Supprimer
                </Button>
              </div>
            }
          >
            <div className="py-2">
              <p className="text-[14px] text-[#4A7A94] leading-relaxed">
                Êtes-vous sûr de vouloir supprimer{" "}
                <strong>{vm.deleteTarget.name}</strong> ? Cette action est
                irréversible et affectera tous les canaux associés.
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
