import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type { EventFunnelDto } from "@/shared/api/generated/types.gen";
import { toast } from "sonner";

const emptyForm: Partial<EventFunnelDto> = {
  code: "",
  name: "",
  isActive: true,
  productId: "",
};

interface FunnelFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: EventFunnelDto | null;
  lockedProductId?: string;
  onSave: (data: Partial<EventFunnelDto>) => Promise<void>;
  isSaving?: boolean;
}

export function FunnelFormModal({
  open,
  onClose,
  editing,
  lockedProductId,
  onSave,
  isSaving,
}: FunnelFormModalProps) {
  const [form, setForm] = useState<Partial<EventFunnelDto>>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            code: editing.code ?? "",
            name: editing.name ?? "",
            isActive: editing.isActive ?? true,
            productId: editing.productId ?? lockedProductId ?? "",
          }
        : { ...emptyForm, productId: lockedProductId ?? "" },
    );
  }, [open, editing, lockedProductId]);

  const save = async () => {
    if (!form.name?.trim() || !form.code?.trim()) {
      toast.error("Le nom et le code sont requis");
      return;
    }
    const productId = lockedProductId ?? form.productId ?? "";
    const base = {
      code: form.code.trim(),
      name: form.name.trim(),
      isActive: form.isActive,
      productId: productId || null,
    };

    if (editing?.id) {
      await onSave({ ...base, id: editing.id });
    } else {
      await onSave(base);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Modifier ${editing.name}` : "Nouveau tunnel (Funnel)"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={save} loading={isSaving}>
            {editing ? "Enregistrer" : "Créer le tunnel"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code du tunnel *"
            placeholder="ex: ONBOARDING"
            value={form.code || ""}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
          <Input
            label="Nom du tunnel *"
            placeholder="ex: Tunnel d'Onboarding"
            value={form.name || ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3">
          <span className="text-[13px] text-[#0D2137]">Tunnel actif</span>
          <Toggle
            checked={form.isActive ?? true}
            onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
          />
        </div>

        {!editing?.id && (
          <p className="text-[12px] text-[#8BAFC0] italic pt-1">
            Vous pourrez configurer les étapes du tunnel depuis sa page de
            détail une fois celui-ci créé.
          </p>
        )}
      </div>
    </Modal>
  );
}
