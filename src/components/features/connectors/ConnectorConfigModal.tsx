import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiConnectorConfigByIdOptions,
  putApiConnectorConfigureMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  WaBusinessConnectorConfig,
  WaBusinessConnectorConfigRequest,
} from "@/shared/api/generated/types.gen";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/feedback/PageLoader";

const CONFIG_FIELDS: {
  key: keyof WaBusinessConnectorConfig;
  label: string;
  secret?: boolean;
}[] = [
  { key: "phoneNumberId", label: "Phone Number ID" },
  { key: "businessAccountId", label: "Business Account ID" },
  { key: "businessId", label: "Business ID" },
  { key: "appName", label: "Nom de l'app" },
  { key: "version", label: "Version API" },
  { key: "verifyToken", label: "Verify Token" },
  { key: "accessToken", label: "Access Token", secret: true },
  { key: "privateKeyPassword", label: "Mot de passe clé privée", secret: true },
];

interface ConnectorConfigModalProps {
  connectorId: string | null;
  connectorName?: string;
  onClose: () => void;
}

/** WhatsApp Business configuration modal for a connector. */
export function ConnectorConfigModal({
  connectorId,
  connectorName,
  onClose,
}: ConnectorConfigModalProps) {
  const [cfg, setCfg] = useState<WaBusinessConnectorConfigRequest>({});

  const { data, isLoading } = useQuery({
    ...getApiConnectorConfigByIdOptions({ path: { id: connectorId ?? "" } }),
    select: (res) => res?.data as WaBusinessConnectorConfig | undefined,
    enabled: !!connectorId,
  });

  useEffect(() => {
    if (data) setCfg({ ...data });
  }, [data]);

  const saveMutation = useMutation({
    ...putApiConnectorConfigureMutation(),
    onSuccess: () => {
      toast.success("Configuration WhatsApp enregistrée");
      onClose();
    },
    onError: () =>
      toast.error("Erreur lors de l'enregistrement de la configuration"),
  });

  const save = () => {
    if (!connectorId) return;
    saveMutation.mutate({ body: { ...cfg, id: connectorId } });
  };

  return (
    <Modal
      open={!!connectorId}
      onClose={onClose}
      title="Configuration WhatsApp Business"
      subtitle={connectorName || undefined}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={save}
            loading={saveMutation.isPending}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="py-8">
          <PageLoader />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {CONFIG_FIELDS.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              type={f.secret ? "password" : "text"}
              value={String((cfg[f.key] as string | null) ?? "")}
              onChange={(e) =>
                setCfg((c) => ({ ...c, [f.key]: e.target.value }))
              }
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
