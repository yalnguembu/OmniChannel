import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users, Save, X } from "lucide-react";
import { toast } from "sonner";
import { ClientSegmentService } from "@/shared/api/services";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/feedback/PageLoader";

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
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["product-segments", productId],
    queryFn: () =>
      ClientSegmentService.search({ productId, pageNumber: 1, pageSize: 100 }) as any,
    enabled: open,
  });

  const segments = data?.data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      ClientSegmentService.create({ name, productId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-segments", productId] });
      qc.invalidateQueries({ queryKey: ["segments-dropdown", productId] });
      setNewName("");
      toast.success("Segment créé");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ClientSegmentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-segments", productId] });
      qc.invalidateQueries({ queryKey: ["segments-dropdown", productId] });
      toast.success("Segment supprimé");
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gérer les segments"
      subtitle="Organisez vos contacts en groupes ciblés pour ce produit"
      size="md"
    >
      <div className="space-y-6 py-2">
        <div className="flex gap-2">
          <Input
            placeholder="Nom du nouveau segment..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="primary"
            onClick={() => createMutation.mutate(newName)}
            disabled={!newName.trim()}
            loading={createMutation.isPending}
          >
            <Plus size={14} /> Créer
          </Button>
        </div>

        <div className="border border-[#E5E7EB] rounded-[14px] overflow-hidden bg-white">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <PageLoader />
            </div>
          ) : segments.length === 0 ? (
            <div className="p-10 text-center text-[#8BAFC0] text-[13px] italic">
              Aucun segment défini pour ce produit.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {segments.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 hover:bg-[#F7F8F9] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E8F4F8] flex items-center justify-center text-[#2E8FAD]">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium text-[#0D2137]">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-[#8BAFC0]">
                        ID: {s.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteMutation.mutate(s.id)}
                      className="p-2 rounded-lg text-[#8BAFC0] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-all"
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
  );
}
