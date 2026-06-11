import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiConnectorSearchQueryKey,
  postApiConnectorMutation,
  putApiConnectorMutation,
  getApiProviderDropdownOptions,
  getApiProductDropdownOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchConnectorResponse } from "@/shared/api/generated/types.gen";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";

const emptyForm = {
  name: "",
  providerId: "",
  productId: "",
  priority: 1,
  isActive: true,
  isDefault: false,
};

interface ConnectorFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: SearchConnectorResponse | null;
  /** When set, the connector is tied to this product and the product field is hidden. */
  lockedProductId?: string;
}

/**
 * Self-contained create/edit modal for a connector.
 * Reused by the integrations connectors list and by a product's Connectors tab.
 * Pass `lockedProductId` to scope the connector to a product (hides the product selector).
 */
export function ConnectorFormModal({
  open,
  onClose,
  editing,
  lockedProductId,
}: ConnectorFormModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data: providers = [] } = useQuery({
    ...getApiProviderDropdownOptions(),
    select: (res: unknown) =>
      (res as { data?: { id: string; name: string }[] })?.data ?? [],
  });

  const { data: products = [] } = useQuery({
    ...getApiProductDropdownOptions(),
    select: (res) =>
      ((res?.data ?? []) as { id?: string; name?: string | null }[]).filter(
        (p) => p.id,
      ),
    enabled: open && !lockedProductId,
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name: editing.name ?? "",
            providerId: editing.providerId ?? "",
            productId: editing.productId ?? lockedProductId ?? "",
            priority: editing.priority ?? 1,
            isActive: editing.isActive ?? true,
            isDefault: editing.isDefault ?? false,
          }
        : { ...emptyForm, productId: lockedProductId ?? "" },
    );
  }, [open, editing, lockedProductId]);

  const onSaved = () => {
    qc.invalidateQueries({ queryKey: postApiConnectorSearchQueryKey() });
    toast.success(editing ? "Connecteur mis à jour" : "Connecteur créé");
    onClose();
  };
  const createMutation = useMutation({
    ...postApiConnectorMutation(),
    onSuccess: onSaved,
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });
  const updateMutation = useMutation({
    ...putApiConnectorMutation(),
    onSuccess: onSaved,
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const save = () => {
    if (!form.name.trim() || !form.providerId) {
      toast.error("Le nom et le provider sont requis");
      return;
    }
    const productId = lockedProductId ?? form.productId ?? "";
    const base = {
      name: form.name.trim(),
      providerId: form.providerId,
      productId: productId || null,
      priority: form.priority,
      isActive: form.isActive,
      isDefault: form.isDefault,
    };
    if (editing?.id) {
      updateMutation.mutate({ body: { ...base, id: editing.id } });
    } else {
      createMutation.mutate({ body: base });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Modifier ${editing.name}` : "Nouveau connecteur"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={save} loading={isSaving}>
            {editing ? "Enregistrer" : "Créer le connecteur"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nom du connecteur *"
          placeholder="ex : Twilio Production"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Select
          label="Provider *"
          value={form.providerId}
          onChange={(e) =>
            setForm((f) => ({ ...f, providerId: e.target.value }))
          }
          options={[
            { value: "", label: "Sélectionner un provider…" },
            ...providers.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        {!lockedProductId && (
          <Select
            label="Produit"
            value={form.productId}
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
          label="Priorité"
          value={String(form.priority)}
          onChange={(e) =>
            setForm((f) => ({ ...f, priority: Number(e.target.value) }))
          }
          options={[
            { value: "1", label: "1 — Primaire" },
            { value: "2", label: "2 — Secondaire" },
            { value: "3", label: "3 — Fallback" },
          ]}
        />
        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3">
          <span className="text-[13px] text-[#0D2137]">Actif</span>
          <Toggle
            checked={form.isActive}
            onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3">
          <span className="text-[13px] text-[#0D2137]">
            Connecteur par défaut
          </span>
          <Toggle
            checked={form.isDefault}
            onChange={(v) => setForm((f) => ({ ...f, isDefault: v }))}
          />
        </div>
      </div>
    </Modal>
  );
}
