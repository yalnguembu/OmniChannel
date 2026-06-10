import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  postApiTagSearchOptions,
  postApiTagSearchQueryKey,
  postApiTagMutation,
  deleteApiTagByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/feedback/PageLoader";
import type { TagDto } from "@/shared/api/types";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";

const TAG_COLORS = [
  "#2E8FAD",
  "#E8541A",
  "#16A34A",
  "#7C3AED",
  "#D97706",
  "#1B5E82",
  "#DC2626",
  "#25D366",
  "#0088CC",
  "#FF6B35",
];

export function TagsPage() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId);
  const [modalOpen, setModalOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);

  const { data: tags = [], isLoading } = useQuery({
    ...postApiTagSearchOptions({ body: { pageNumber: 1, pageSize: 100 } }),
    select: (res: any) => (res?.data?.items ?? []) as TagDto[],
  });

  const createMutation = useMutation({
    ...postApiTagMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiTagSearchQueryKey() });
      setModalOpen(false);
      toast.success("Tag créé");
    },
    onError: () => toast.error("Erreur"),
  });

  const deleteMutation = useMutation({
    ...deleteApiTagByIdMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiTagSearchQueryKey() });
      toast.success("Tag supprimé");
    },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              Tags
            </h1>
            <p className="text-[12.5px] text-[#4A7A94] mt-1">
              Créez et gérez vos tags personnalisés
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-[#0D2137]">
            {tags.length} tag{tags.length !== 1 ? "s" : ""} disponible
            {tags.length !== 1 ? "s" : ""}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setModalOpen(true);
              setTagName("");
              setTagColor(TAG_COLORS[0]);
            }}
          >
            <Plus size={13} />
            Nouveau tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer hover:shadow-[0_2px_8px_rgba(13,33,55,0.08)] transition-all group"
              style={{ borderColor: (tag.color ?? "#2E8FAD") + "40" }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: tag.color ?? "#2E8FAD" }}
              />
              <span
                className="text-[12.5px] font-medium"
                style={{ color: tag.color ?? "#2E8FAD" }}
              >
                {tag.name}
              </span>
              <button
                onClick={() => deleteMutation.mutate({ path: { id: tag.id } })}
                className="w-4 h-4 rounded-full bg-black/8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FEE2E2] hover:text-[#DC2626] cursor-pointer"
              >
                <X size={8} />
              </button>
            </div>
          ))}
          {tags.length === 0 && (
            <p className="text-[12.5px] text-[#8BAFC0] italic">
              Aucun tag créé
            </p>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouveau tag"
        size="sm"
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
                    name: tagName,
                    color: tagColor,
                    companyId: companyId ?? undefined,
                  } as any,
                })
              }
              loading={createMutation.isPending}
            >
              Créer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nom du tag"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="ex : VIP"
          />
          <div>
            <label className="text-[12.5px] font-medium text-[#0D2137] mb-2 block">
              Couleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setTagColor(c)}
                  className="w-7 h-7 rounded-[7px] border-2 transition-all cursor-pointer"
                  style={{
                    background: c,
                    borderColor: tagColor === c ? c : "transparent",
                    outlineOffset: "2px",
                    outline: tagColor === c ? `2px solid ${c}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
          {tagName && (
            <div className="flex items-center gap-2">
              <p className="text-[12px] text-[#8BAFC0]">Aperçu :</p>
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12.5px] font-medium"
                style={{ borderColor: tagColor + "40", color: tagColor }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: tagColor }}
                />
                {tagName}
              </span>
            </div>
          )}
        </div>
      </Modal>
        </div>
      </div>
    </div>
  );
}
