import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { EntitySelect } from "./EntitySelect";
import type { EventDefinitionDto } from "@/shared/api/generated/types.gen";
import { toast } from "sonner";

interface EventInfoModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  editing: EventDefinitionDto | null;
  onSave: (data: any) => Promise<any>;
  isSaving?: boolean;
}

const emptyForm = {
  code: "",
  label: "",
  origin: "Internal",
  isActive: true,
  senderId: "",
};

export function EventInfoModal({
  open,
  onClose,
  productId,
  editing,
  onSave,
  isSaving,
}: EventInfoModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            code: editing.code ?? "",
            label: editing.label ?? "",
            origin: editing.origin ?? "Internal",
            isActive: editing.isActive ?? true,
            senderId: editing.senderId ?? "",
          }
        : emptyForm,
    );
  }, [open, editing]);

  const save = async () => {
    if (!form.code.trim()) {
      toast.error("Le code est requis");
      return;
    }

    // On edit, spread the existing event first so fields this light modal
    // doesn't expose (payloadSchema, correlationSourceKey…) survive the save.
    await onSave({
      body: {
        ...(editing ?? {}),
        id: editing?.id,
        productId,
        code: form.code.trim(),
        label: form.label.trim(),
        origin: form.origin,
        isActive: form.isActive,
        senderId: form.senderId || null,
        matchRule: form.origin === "Internal" ? editing?.matchRule ?? null : null,
        captureSpec: editing?.captureSpec ?? JSON.stringify({ captures: [] }),
      },
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Modifier ${editing.label || editing.code}` : "Nouvel événement"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={save} loading={isSaving}>
            {editing ? "Enregistrer" : "Créer l'événement"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Code *"
            placeholder="user_signup"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
          <Input
            label="Libellé"
            placeholder="Inscription utilisateur"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Origine"
            value={form.origin}
            onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
            options={[
              { value: "Internal", label: "Interne (Messages WhatsApp)" },
              { value: "External", label: "Externe (Appel API HTTP)" },
            ]}
          />
          <EntitySelect
            source="sender"
            label="Sender (optionnel)"
            value={form.senderId}
            onChange={(v) => setForm((f) => ({ ...f, senderId: v }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3">
          <span className="text-[13px] text-[#0D2137]">Événement actif</span>
          <Toggle
            checked={form.isActive}
            onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
          />
        </div>

        {!editing && (
          <p className="text-[12px] text-[#8BAFC0] italic pt-1">
            Vous pourrez configurer la règle de détection, les extractions et
            les triggers une fois l'événement créé.
          </p>
        )}
      </div>
    </Modal>
  );
}
