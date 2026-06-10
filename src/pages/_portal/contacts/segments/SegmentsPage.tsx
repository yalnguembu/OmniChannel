import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Users, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  getApiProductDropdownOptions,
  postApiClientSegmentSearchOptions,
  postApiClientSegmentSearchQueryKey,
  postApiClientSegmentMutation,
  deleteApiClientSegmentByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/data-table/DataTable";
import { fmt, cn } from "@/lib/utils";
import { SegmentCriteriaModal } from "@/components/features/contacts/SegmentCriteriaModal";
import { mapToSegmentModels, type SegmentModel } from "@/models/client.model";
import type { ClientSegmentDto } from "@/shared/api/generated/types.gen";
import { staggerContainer, cardItem } from "@/lib/animations";

export function SegmentsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [segName, setSegName] = useState("");
  const [segDesc, setSegDesc] = useState("");
  const [segProductId, setSegProductId] = useState("");
  const [isDynamic, setIsDynamic] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSegment, setEditorSegment] = useState<SegmentModel | null>(null);

  const { data: productsData } = useQuery({
    ...getApiProductDropdownOptions(),
    select: (res: any) =>
      (res?.data ?? []) as { id: string; name: string }[],
  });
  const products = productsData ?? [];
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    ...postApiClientSegmentSearchOptions({
      body: {
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
      },
    }),
    select: (res) => ({
      items: mapToSegmentModels([...(res?.data?.items ?? [])]),
      total: res?.data?.totalCount ?? 0,
    }),
  });

  const segments: SegmentModel[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

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

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Segments
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            {total} segment{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <SearchInput
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            containerClassName="w-52"
          />
          <Button
            variant="primary"
            onClick={() => {
              setModalOpen(true);
              setSegName("");
              setSegDesc("");
              setSegProductId(products[0]?.id ?? "");
              setIsDynamic(false);
            }}
          >
            <Plus size={13} />
            Nouveau segment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : segments.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Aucun segment"
          description="Créez des segments pour regrouper vos contacts"
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
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
            className="grid grid-cols-3 gap-3.5"
          >
            {segments.map((seg) => (
              <motion.div
                key={seg.id}
                variants={cardItem}
                className="bg-white border border-[#E5E7EB] rounded-[20px] p-5 cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.1)] hover:border-[#6AB8D4]/50 transition-all duration-[220ms]"
                onClick={() =>
                  navigate({
                    to: "/contacts/segments/$segmentId",
                    params: { segmentId: seg.id },
                  })
                }
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-md bg-[#E8F4F8] flex items-center justify-center shrink-0">
                    <Users size={18} className="text-[#2E8FAD]" />
                  </div>
                  <div className="flex gap-1.5">
                    {seg.isDynamic && <Badge variant="purple">Dynamique</Badge>}
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
                      onClick={() => deleteMutation.mutate({ path: { id: seg.id } })}
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
              onClick={() => setModalOpen(true)}
              className="bg-transparent border border-dashed border-[#E5E7EB] rounded-[20px] flex flex-col items-center justify-center gap-3 p-8 cursor-pointer hover:bg-white hover:border-[#2E8FAD]/40 hover:border-solid hover:shadow-[0_4px_20px_rgba(13,33,55,0.06)] transition-all min-h-[180px]"
            >
              <div className="w-11 h-11 rounded-[12px] bg-[#F0F2F4] border border-[#E5E7EB] flex items-center justify-center">
                <Plus size={20} className="text-[#4A7A94]" />
              </div>
              <p className="text-[14px] font-medium text-[#4A7A94]">
                Nouveau segment
              </p>
            </motion.div>
          </motion.div>
          <Pagination
            total={total}
            pageSize={pageSize}
            page={page}
            onChange={setPage}
          />
        </>
      )}

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
                    productId: segProductId || undefined,
                    name: segName,
                    description: segDesc || undefined,
                    isDynamic,
                  },
                })
              }
              loading={createMutation.isPending}
            >
              Créer le segment
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {products.length > 0 && (
            <div>
              <label className="block text-[12.5px] font-medium text-[#0D2137] mb-1.5">
                Produit *
              </label>
              <select
                value={segProductId}
                onChange={(e) => setSegProductId(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0D2137] outline-none focus:border-[#2E8FAD] transition-colors"
              >
                <option value="">Sélectionner un produit</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
        productId={editorSegment?.productId ?? ""}
        segment={editorSegment as unknown as ClientSegmentDto}
      />
    </div>
  );
}
