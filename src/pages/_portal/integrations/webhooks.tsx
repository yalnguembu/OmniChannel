import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Activity, ListChecks } from "lucide-react";
import { toast } from "sonner";
import {
  postApiWebhookEndpointSearchOptions,
  postApiWebhookEndpointSearchQueryKey,
  postApiWebhookEndpointMutation,
  deleteApiWebhookEndpointByIdMutation,
  postApiWebhookDeliverySearchOptions,
  getApiWebhookDeliveryDetailByIdOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  SearchWebhookDeliveryResponse,
  WebhookDeliveryDto,
} from "@/shared/api/generated/types.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { WebhookEndpointDto } from "@/shared/api/types";

import { IntegrationsTabs } from "./IntegrationsTabs";

const ALL_EVENTS = [
  "message.delivered",
  "message.failed",
  "message.opened",
  "message.clicked",
  "campaign.started",
  "campaign.completed",
  "contact.created",
  "contact.updated",
];

export function WebhooksPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WebhookEndpointDto | null>(
    null,
  );
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [timeoutSec, setTimeoutSec] = useState(30);
  const [maxRetries, setMaxRetries] = useState(3);
  const [deliveriesFor, setDeliveriesFor] = useState<{ id: string; url: string } | null>(null);

  const { data: webhooks = [], isLoading } = useQuery({
    ...postApiWebhookEndpointSearchOptions({
      body: { pageNumber: 1, pageSize: 50 },
    }),
    select: (res: any) => (res?.data?.items ?? []) as WebhookEndpointDto[],
  });

  const createMutation = useMutation({
    ...postApiWebhookEndpointMutation(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: postApiWebhookEndpointSearchQueryKey(),
      });
      setModalOpen(false);
      toast.success("Endpoint créé");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const deleteMutation = useMutation({
    ...deleteApiWebhookEndpointByIdMutation(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: postApiWebhookEndpointSearchQueryKey(),
      });
      setDeleteTarget(null);
      toast.success("Endpoint supprimé");
    },
    onError: () => toast.error("Erreur"),
  });

  const toggleEvent = (ev: string) =>
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev],
    );

  return (
    <div className="p-7">
      <div className="mb-2">
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Intégrations
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          Connecteurs, webhooks, API Keys & logs
        </p>
      </div>
      <IntegrationsTabs />

      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-[#4A7A94]">
          {webhooks.length} endpoint{webhooks.length !== 1 ? "s" : ""} configuré
          {webhooks.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="primary"
          onClick={() => {
            setModalOpen(true);
            setSelectedEvents([]);
            setUrlInput("");
            setTimeoutSec(30);
            setMaxRetries(3);
          }}
        >
          <Plus size={13} />
          Nouvel endpoint
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : webhooks.length === 0 ? (
        <EmptyState
          icon={<Activity size={32} />}
          title="Aucun webhook configuré"
          description="Recevez des notifications en temps réel sur vos endpoints"
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={13} />
              Nouvel endpoint
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden hover:border-[#6AB8D4] transition-colors"
            >
              <div className="flex items-center gap-3.5 px-5 py-4">
                <div
                  className={cn(
                    "w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 border",
                    wh.isActive
                      ? "bg-[#DCFCE7] border-[#86EFAC]"
                      : "bg-[#F0F2F4] border-[#E5E7EB]",
                  )}
                >
                  <Activity
                    size={14}
                    className={
                      wh.isActive ? "text-[#16A34A]" : "text-[#8BAFC0]"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[13px] font-medium text-[#0D2137] truncate">
                    {wh.url}
                  </p>
                  <p className="text-[11.5px] text-[#8BAFC0] mt-0.5">
                    Timeout: {wh.timeoutSeconds ?? 30}s · Max retries:{" "}
                    {wh.maxRetries ?? 3}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={wh.isActive ? "success" : "neutral"} dot>
                    {wh.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      wh.id && setDeliveriesFor({ id: wh.id, url: wh.url ?? "" })
                    }
                  >
                    <ListChecks size={12} />
                    Livraisons
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(wh)}
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {(wh.events ?? []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap px-5 pb-3.5">
                  {(wh.events ?? []).map((ev: string) => (
                    <code
                      key={ev}
                      className="text-[10.5px] px-2 py-0.5 rounded bg-[#F0F2F4] text-[#4A7A94] border border-[#E5E7EB] font-mono"
                    >
                      {ev}
                    </code>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouvel endpoint webhook"
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
                    url: urlInput,
                    // API: events is string | null (comma-separated)
                    events: selectedEvents.join(","),
                    isActive: true,
                    timeoutSeconds: timeoutSec,
                    maxRetries,
                  } as any,
                })
              }
              loading={createMutation.isPending}
            >
              Créer l'endpoint
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="URL de l'endpoint *"
            placeholder="https://votre-domaine.com/webhooks/omni"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            hint="Doit être accessible publiquement en HTTPS."
          />
          <div>
            <label className="text-[12.5px] font-medium text-[#0D2137] mb-2 block">
              Événements à écouter
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map((ev) => (
                <label
                  key={ev}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border rounded-[8px] cursor-pointer transition-all text-[12px]",
                    selectedEvents.includes(ev)
                      ? "border-[#2E8FAD] bg-[#E8F4F8]"
                      : "border-[#E5E7EB] hover:bg-[#F7F8F9]",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                    className="accent-[#2E8FAD]"
                  />
                  <code className="font-mono text-[11px] text-[#4A7A94]">
                    {ev}
                  </code>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Timeout (sec)"
              type="number"
              value={String(timeoutSec)}
              onChange={(e) => setTimeoutSec(Number(e.target.value))}
            />
            <Input
              label="Retries max"
              type="number"
              value={String(maxRetries)}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer l'endpoint"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                deleteTarget &&
                deleteMutation.mutate({ path: { id: deleteTarget.id } })
              }
              loading={deleteMutation.isPending}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-md">
          <p className="text-[12.5px] text-[#DC2626]">
            Supprimer cet endpoint arrêtera toutes les livraisons en cours.
          </p>
        </div>
      </Modal>

      <WebhookDeliveriesModal
        endpoint={deliveriesFor}
        onClose={() => setDeliveriesFor(null)}
      />
    </div>
  );
}

function deliveryStatusVariant(s?: string | null) {
  const v = (s ?? "").toLowerCase();
  if (/(deliver|success|sent|ok)/.test(v)) return "success" as const;
  if (/(fail|error|échou|echou)/.test(v)) return "error" as const;
  if (/(pending|retry|queue|cours|run)/.test(v)) return "info" as const;
  return "neutral" as const;
}

function WebhookDeliveriesModal({
  endpoint,
  onClose,
}: {
  endpoint: { id: string; url: string } | null;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    ...postApiWebhookDeliverySearchOptions({
      body: { webhookEndpointId: endpoint?.id, pageNumber: 1, pageSize: 50 },
    }),
    select: (res) =>
      [...(res?.data?.items ?? [])] as SearchWebhookDeliveryResponse[],
    enabled: !!endpoint?.id,
  });
  const deliveries = data ?? [];

  const { data: detail } = useQuery({
    ...getApiWebhookDeliveryDetailByIdOptions({ path: { id: selectedId ?? "" } }),
    select: (res) => res?.data as WebhookDeliveryDto | undefined,
    enabled: !!selectedId,
  });

  useEffect(() => {
    setSelectedId(null);
  }, [endpoint?.id]);

  return (
    <Modal
      open={!!endpoint}
      onClose={onClose}
      title="Livraisons webhook"
      subtitle={endpoint?.url}
      size="lg"
    >
      {isLoading ? (
        <div className="py-8">
          <PageLoader />
        </div>
      ) : deliveries.length === 0 ? (
        <p className="py-8 text-center text-[13px] italic text-[#8BAFC0]">
          Aucune livraison enregistrée.
        </p>
      ) : (
        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {deliveries.map((d) => (
            <div key={d.id} className="rounded-md border border-[#E5E7EB]">
              <button
                onClick={() =>
                  setSelectedId((p) => (p === d.id ? null : d.id ?? null))
                }
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#F7F8F9]"
              >
                <Badge variant={deliveryStatusVariant(d.status)} dot>
                  {d.status || "—"}
                </Badge>
                <code className="text-[12px] text-[#0D2137]">
                  {d.eventType || "—"}
                </code>
                <span className="text-[11.5px] text-[#8BAFC0]">
                  HTTP {d.httpStatusCode ?? "—"} · tentative {d.attemptCount ?? 0}
                </span>
                <span className="ml-auto text-[11px] text-[#8BAFC0]">
                  {d.sentAt
                    ? formatRelative(d.sentAt)
                    : d.createdAt
                      ? formatRelative(d.createdAt)
                      : "—"}
                </span>
              </button>
              {selectedId === d.id && (
                <div className="space-y-2 border-t border-[#E5E7EB] bg-[#F7F8F9] p-3">
                  {(detail?.errorMessage || d.errorMessage) && (
                    <DeliveryField
                      label="Erreur"
                      value={detail?.errorMessage ?? d.errorMessage}
                      error
                    />
                  )}
                  <DeliveryField
                    label="Payload"
                    value={detail?.payload ?? d.payload}
                  />
                  <DeliveryField
                    label="Réponse"
                    value={detail?.responseBody ?? d.responseBody}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function DeliveryField({
  label,
  value,
  error,
}: {
  label: string;
  value?: string | null;
  error?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "mb-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]",
          error ? "text-[#DC2626]" : "text-[#8BAFC0]",
        )}
      >
        {label}
      </p>
      <pre
        className={cn(
          "max-h-[160px] overflow-auto whitespace-pre-wrap rounded-[8px] p-2.5 text-[11.5px]",
          error
            ? "bg-[#FEF2F2] text-[#B91C1C]"
            : "border border-[#E5E7EB] bg-white text-[#4A7A94]",
        )}
      >
        {value || "—"}
      </pre>
    </div>
  );
}
