import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Trash2, Edit, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  postApiClientSegmentSearchOptions,
  postApiClientSegmentSearchQueryKey,
  postApiClientSegmentMutation,
  deleteApiClientSegmentByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/data-table/DataTable";
import { fmt } from "@/lib/utils";
import {
  ListFilterBar,
  type FilterFieldConfig,
} from "@/components/features/shared/ListFilterBar";
import { useListFilters } from "@/hooks/useListFilters";
import { SegmentCriteriaModal } from "@/components/features/contacts/SegmentCriteriaModal";
import { mapToSegmentModels, type SegmentModel } from "@/models/client.model";
import type { ClientSegmentDto } from "@/shared/api/generated/types.gen";
import { staggerContainer, cardItem } from "@/lib/animations";

const ADVANCED_DEFAULTS = {
  sortBy: "createdAt",
  sortDirection: "desc",
  pageSize: "12",
  clientId: "",
  segmentId: "",
  segmentIds: "",
};

const SEGMENT_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    key: "sortBy",
    label: "Trier par",
    type: "select",
    options: [
      { value: "createdAt", label: "Date de création" },
      { value: "name", label: "Nom" },
      { value: "clientCount", label: "Nombre de contacts" },
      { value: "lastCalculatedAt", label: "Dernier recalcul" },
    ],
  },
  {
    key: "sortDirection",
    label: "Ordre",
    type: "select",
    options: [
      { value: "desc", label: "Décroissant" },
      { value: "asc", label: "Croissant" },
    ],
  },
  {
    key: "pageSize",
    label: "Par page",
    type: "select",
    options: [
      { value: "12", label: "12" },
      { value: "24", label: "24" },
      { value: "48", label: "48" },
      { value: "96", label: "96" },
    ],
  },
  {
    key: "clientId",
    label: "ID client",
    type: "text",
    placeholder: "Segments contenant ce client…",
  },
  {
    key: "segmentId",
    label: "ID segment",
    type: "text",
    placeholder: "Un identifiant de segment…",
  },
  {
    key: "segmentIds",
    label: "IDs de segments",
    type: "text",
    placeholder: "id1, id2, id3…",
    help: "Plusieurs identifiants séparés par des virgules.",
    fullWidth: true,
  },
];

export function SegmentsPage({ productId }: { productId: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const f = useListFilters(ADVANCED_DEFAULTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [segName, setSegName] = useState("");
  const [segDesc, setSegDesc] = useState("");
  const [isDynamic, setIsDynamic] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSegment, setEditorSegment] = useState<SegmentModel | null>(null);

  const { data, isLoading } = useQuery({
    ...postApiClientSegmentSearchOptions({
      body: {
        productId,
        ...f.commonBody(),
        // Not on SearchClientSegmentRequest — forwarded verbatim; the backend
        // applies whatever it supports.
        clientId: f.advanced.clientId?.trim() || undefined,
        segmentId: f.advanced.segmentId?.trim() || undefined,
        segmentIds: f.advanced.segmentIds?.trim()
          ? f.advanced.segmentIds.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      } as any,
    }),
    select: (res) => ({
      items: mapToSegmentModels([...(res?.data?.items ?? [])]),
      total: res?.data?.totalCount ?? 0,
    }),
  });

  const segments: SegmentModel[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  const openCreate = () => {
    setSegName("");
    setSegDesc("");
    setIsDynamic(false);
    setModalOpen(true);
  };

  const createMutation = useMutation({
    ...postApiClientSegmentMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiClientSegmentSearchQueryKey() });
      setModalOpen(false);
      toast.success("Segment créé");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const deleteMutation = useMutation({
    ...deleteApiClientSegmentByIdMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiClientSegmentSearchQueryKey() });
      toast.success("Segment supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const goToDetail = (id: string) =>
    navigate({
      to: "/$productId/contacts/segments/$segmentId",
      params: { productId, segmentId: id },
    });

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8F9]/30">
      <ListFilterBar
        search={f.search}
        onSearchChange={f.setSearch}
        searchPlaceholder="Rechercher un segment…"
        dateRange={f.dateRange}
        onDateRangeChange={f.setDateRange}
        advancedFields={SEGMENT_FILTER_FIELDS}
        advancedValues={f.advanced}
        advancedDefaults={f.advancedDefaults}
        onApplyAdvanced={f.applyAdvanced}
        isFilterModalOpen={f.isFilterModalOpen}
        setIsFilterModalOpen={f.setIsFilterModalOpen}
        actions={[
          {
            label: "Nouveau segment",
            icon: <Plus size={13} strokeWidth={2.5} />,
            onClick: openCreate,
          },
        ]}
      />

      <div className="flex-1 p-8 max-w-[1400px] w-full mx-auto">
        <button
          onClick={() =>
            navigate({ to: "/$productId/contacts", params: { productId } })
          }
          className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} /> Contacts
        </button>

        <div className="mb-5">
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Segments
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            {total} segment{total !== 1 ? "s" : ""}
          </p>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : segments.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="Aucun segment"
            description="Créez des segments pour regrouper vos contacts"
            action={
              <Button variant="primary" onClick={openCreate}>
                <Plus size={13} />
                Nouveau segment
              </Button>
            }
          />
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
            >
              <AnimatePresence mode="popLayout">
                {segments.map((seg) => (
                  <motion.div
                    key={seg.id}
                    variants={cardItem}
                    layout
                    className="bg-white border border-[#E5E7EB] rounded-[20px] p-5 cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.1)] hover:border-[#6AB8D4]/50 transition-all duration-[220ms]"
                    onClick={() => goToDetail(seg.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-md bg-[#E8F4F8] flex items-center justify-center shrink-0">
                        <Users size={18} className="text-[#2E8FAD]" />
                      </div>
                      <div className="flex gap-1.5">
                        {seg.isDynamic && (
                          <Badge variant="purple">Dynamique</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-[14.5px] font-semibold text-[#0D2137] tracking-tight mb-1">
                      {seg.name}
                    </p>
                    {seg.description && (
                      <p className="text-[12.5px] text-[#4A7A94] leading-relaxed mb-3 line-clamp-2">
                        {seg.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[#8BAFC0]" />
                        <span className="text-[12.5px] font-semibold text-[#0D2137]">
                          {fmt(seg.clientCount)}
                        </span>
                        <span className="text-[11.5px] text-[#8BAFC0]">
                          contacts
                        </span>
                      </div>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => goToDetail(seg.id)}
                          title="Voir le détail"
                          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setEditorSegment(seg);
                            setEditorOpen(true);
                          }}
                          title="Modifier les critères"
                          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all cursor-pointer"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() =>
                            deleteMutation.mutate({ path: { id: seg.id } })
                          }
                          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  variants={cardItem}
                  layout
                  onClick={openCreate}
                  className="bg-transparent border border-dashed border-[#E5E7EB] rounded-[20px] flex flex-col items-center justify-center gap-3 p-8 cursor-pointer hover:bg-white hover:border-[#2E8FAD]/40 hover:border-solid hover:shadow-[0_4px_20px_rgba(13,33,55,0.06)] transition-all min-h-[180px]"
                >
                  <div className="w-11 h-11 rounded-[12px] bg-[#F0F2F4] border border-[#E5E7EB] flex items-center justify-center">
                    <Plus size={20} className="text-[#4A7A94]" />
                  </div>
                  <p className="text-[14px] font-medium text-[#4A7A94]">
                    Nouveau segment
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="flex justify-center mt-8">
              <Pagination
                total={total}
                pageSize={f.pageSize}
                page={f.page}
                onChange={f.setPage}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouveau segment"
        subtitle="Regroupez vos contacts selon des critères définis"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                createMutation.mutate({
                  body: {
                    productId,
                    name: segName,
                    description: segDesc || undefined,
                    isDynamic,
                  },
                })
              }
              loading={createMutation.isPending}
              disabled={!segName.trim()}
            >
              Créer le segment
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nom du segment *"
            placeholder="ex : Clients VIP"
            value={segName}
            onChange={(e) => setSegName(e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Décrivez les critères de ce segment…"
            value={segDesc}
            onChange={(e) => setSegDesc(e.target.value)}
          />
          <div className="flex items-center justify-between p-4 bg-[#F7F8F9] border border-[#E5E7EB] rounded-md">
            <div>
              <p className="text-[13px] font-medium text-[#0D2137]">
                Segment dynamique
              </p>
              <p className="text-[12px] text-[#8BAFC0] mt-0.5">
                Le segment se recalcule automatiquement
              </p>
            </div>
            <Toggle checked={isDynamic} onChange={setIsDynamic} />
          </div>
        </div>
      </Modal>

      <SegmentCriteriaModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        productId={editorSegment?.productId ?? productId}
        segment={editorSegment as unknown as ClientSegmentDto}
      />
    </div>
  );
}
