import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiConnectorSearchOptions,
  postApiTemplateImportWhatsappMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchConnectorResponse } from "@/shared/api/generated/types.gen";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface TemplateImportModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Imports WhatsApp Business templates from Meta for a given connector.
 * The connector is required by the API; the template name is optional
 * (leave empty to import every template available on the connector).
 */
export function TemplateImportModal({ open, onClose }: TemplateImportModalProps) {
  const [connectorId, setConnectorId] = useState("");
  const [templateName, setTemplateName] = useState("");

  const { data: connectors = [] } = useQuery({
    ...postApiConnectorSearchOptions({ body: { pageNumber: 1, pageSize: 100 } }),
    select: (res) => (res?.data?.items ?? []) as SearchConnectorResponse[],
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setConnectorId("");
      setTemplateName("");
    }
  }, [open]);

  const importMutation = useMutation({
    ...postApiTemplateImportWhatsappMutation(),
    onSuccess: () => {
      toast.success("Import WhatsApp lancé — les templates apparaîtront sous peu");
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'import WhatsApp"),
  });

  const submit = () => {
    if (!connectorId) {
      toast.error("Sélectionnez un connecteur WhatsApp");
      return;
    }
    importMutation.mutate({
      body: {
        connectorId,
        templateName: templateName.trim() || null,
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importer depuis WhatsApp Business"
      subtitle="Récupère les templates approuvés par Meta pour un connecteur"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={importMutation.isPending}
          >
            Importer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Connecteur WhatsApp *"
          value={connectorId}
          onChange={(e) => setConnectorId(e.target.value)}
          options={[
            { value: "", label: "Sélectionner un connecteur…" },
            ...connectors.map((c) => ({
              value: c.id ?? "",
              label: c.providerName
                ? `${c.name ?? "Sans nom"} · ${c.providerName}`
                : c.name ?? "Sans nom",
            })),
          ]}
        />
        <Input
          label="Nom du template (optionnel)"
          placeholder="Laisser vide pour importer tous les templates"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>
    </Modal>
  );
}
