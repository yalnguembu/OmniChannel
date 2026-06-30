import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  getApiProductDropdownOptions,
  getApiSenderDropdownOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { FlowDto } from "@/shared/api/generated/types.gen";
import { toast } from "sonner";

const emptyForm: Partial<FlowDto> = {
  code: "",
  name: "",
  provider: "",
  providerFlowId: "",
  status: "Draft",
  productId: "",
  senderId: "",
  bodyText: "",
  ctaText: "",
  flowAction: "",
  flowTokenAttributeKey: "",
  parameters: "",
};

interface FlowFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: FlowDto | null;
  lockedProductId?: string;
  onSave: (data: Partial<FlowDto>) => Promise<void>;
  isSaving?: boolean;
}

export function FlowFormModal({
  open,
  onClose,
  editing,
  lockedProductId,
  onSave,
  isSaving,
}: FlowFormModalProps) {
  const [form, setForm] = useState<Partial<FlowDto>>(emptyForm);

  const { data: products = [] } = useQuery({
    ...getApiProductDropdownOptions(),
    select: (res) =>
      ((res?.data ?? []) as { id?: string; name?: string | null }[]).filter(
        (p) => p.id,
      ),
    enabled: open && !lockedProductId,
  });

  const { data: senders = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res) =>
      ((res?.data ?? []) as { id?: string; name?: string | null }[]).filter(
        (p) => p.id,
      ),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            code: editing.code ?? "",
            name: editing.name ?? "",
            provider: editing.provider ?? "",
            providerFlowId: editing.providerFlowId ?? "",
            status: editing.status ?? "Draft",
            productId: editing.productId ?? lockedProductId ?? "",
            senderId: editing.senderId ?? "",
            bodyText: editing.bodyText ?? "",
            ctaText: editing.ctaText ?? "",
            flowAction: editing.flowAction ?? "",
            flowTokenAttributeKey: editing.flowTokenAttributeKey ?? "",
            parameters: editing.parameters ?? "",
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
      provider: form.provider,
      providerFlowId: form.providerFlowId,
      status: form.status,
      productId: productId || null,
      senderId: form.senderId || null,
      bodyText: form.bodyText,
      ctaText: form.ctaText,
      flowAction: form.flowAction,
      flowTokenAttributeKey: form.flowTokenAttributeKey,
      parameters: form.parameters,
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
      title={editing ? `Modifier ${editing.name}` : "Nouveau Flux"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={save} loading={isSaving}>
            {editing ? "Enregistrer" : "Créer le flux"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code du flux *"
            placeholder="ex: ORDER_CONFIRM"
            value={form.code || ""}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
          <Input
            label="Nom du flux *"
            placeholder="ex: Confirmation de commande"
            value={form.name || ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Provider"
            placeholder="ex: whatsapp"
            value={form.provider || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, provider: e.target.value }))
            }
          />
          <Input
            label="Provider Flow ID"
            placeholder="ex: flow_12345"
            value={form.providerFlowId || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, providerFlowId: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!lockedProductId && (
            <Select
              label="Produit"
              value={form.productId || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, productId: e.target.value }))
              }
              options={[
                { value: "", label: "Aucun produit" },
                ...products.map((p) => ({
                  value: p.id as string,
                  label: p.name ?? "Sans nom",
                })),
              ]}
            />
          )}

          <Select
            label="Sender (Expéditeur)"
            value={form.senderId || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, senderId: e.target.value }))
            }
            options={[
              { value: "", label: "Aucun sender" },
              ...senders.map((s) => ({
                value: s.id as string,
                label: s.name ?? "Sans nom",
              })),
            ]}
          />

          <Select
            label="Statut"
            value={form.status || "Draft"}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={[
              { value: "Draft", label: "Brouillon (Draft)" },
              { value: "Published", label: "Publié (Published)" },
              { value: "Deprecated", label: "Déprécié (Deprecated)" },
            ]}
          />
        </div>

        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-3 bg-[#F9FAFB]">
          <h4 className="text-[13px] font-semibold text-[#0D2137]">
            Contenu et Actions
          </h4>
          <Input
            label="Texte principal (Body)"
            value={form.bodyText || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, bodyText: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Texte du bouton (CTA)"
              value={form.ctaText || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, ctaText: e.target.value }))
              }
            />
            <Input
              label="Action du flux"
              value={form.flowAction || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, flowAction: e.target.value }))
              }
            />
          </div>
          <Input
            label="Clé d'attribut du token"
            value={form.flowTokenAttributeKey || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, flowTokenAttributeKey: e.target.value }))
            }
            placeholder="ex: auth_token"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#0D2137] mb-1">
            Paramètres additionnels (JSON)
          </label>
          <textarea
            className="w-full h-24 p-3 text-[13px] font-mono border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#4A7A94]"
            value={form.parameters || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, parameters: e.target.value }))
            }
            placeholder='{"key": "value"}'
          />
        </div>
      </div>
    </Modal>
  );
}
