import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  postApiClientSegmentSearchOptions,
  postApiClientSegmentSearchQueryKey,
  deleteApiClientSegmentByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { ClientSegmentDto } from "@/shared/api/generated/types.gen";
import {
  mapToSegmentModel,
  mapToSegmentModels,
  type SegmentModel,
} from "@/models/client.model";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/feedback/PageLoader";
import { fmt } from "@/lib/utils";
import { SegmentCriteriaModal } from "./SegmentCriteriaModal";

interface SegmentManagerModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

export function SegmentManagerModal({
  open,
  onClose,
  productId,
}: SegmentManagerModalProps) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentModel | null>(null);

  const { data, isLoading } = useQuery({
    ...postApiClientSegmentSearchOptions({
      body: { productId, pageNumber: 1, pageSize: 100 },
    }),
    select: (res) => mapToSegmentModels([...(res?.data?.items ?? [])]),
    enabled: open && !editorOpen,
  });
  const segments = data ?? [];

  const deleteMutation = useMutation({
    ...deleteApiClientSegmentByIdMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiClientSegmentSearchQueryKey() });
      toast.success("Segment supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const openEditor = (segment: SegmentModel | null) => {
    setEditing(segment);
    setEditorOpen(true);
  };

  return (
    <>
      {/* List — hidden while the criteria editor is open (drill-in). */}
      <Modal
        open={open && !editorOpen}
        onClose={onClose}
        title="Gérer les segments"
        subtitle="Organisez vos contacts par critères pour ce produit"
        size="md"
      >
        <div className="space-y-5 py-1">
          <div className="flex gap-2">
            <Input
              placeholder="Nom du nouveau segment..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={() => {
                openEditor(mapToSegmentModel({ name: newName.trim(), productId }));
                setNewName("");
              }}
              disabled={!newName.trim()}
            >
              <Plus size={14} /> Créer
            </Button>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <PageLoader />
              </div>
            ) : segments.length === 0 ? (
              <div className="p-10 text-center text-[13px] italic text-[#8BAFC0]">
                Aucun segment défini pour ce produit.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {segments.map((s) => (
                  <div
                    key={s.id}
                    className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#F7F8F9]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F4F8] text-[#2E8FAD]">
                        <Users size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-[#0D2137]">
                          {s.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[11px] text-[#8BAFC0]">
                            {fmt(s.clientCount ?? 0)} client(s)
                          </span>
                          <Badge
                            variant={s.isDynamic ? "info" : "neutral"}
                            className="text-[10px]"
                          >
                            {s.isDynamic ? "Dynamique" : "Statique"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditor(s)}
                      >
                        <SlidersHorizontal size={13} /> Critères
                      </Button>
                      <button
                        onClick={() => deleteMutation.mutate({ path: { id: s.id } })}
                        className="rounded-lg p-2 text-[#8BAFC0] transition-all hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                        title="Supprimer le segment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <SegmentCriteriaModal
        open={open && editorOpen}
        onClose={() => setEditorOpen(false)}
        productId={productId}
        segment={editing as unknown as ClientSegmentDto}
      />
    </>
  );
}
