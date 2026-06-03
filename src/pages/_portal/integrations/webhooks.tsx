import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Settings, Activity } from "lucide-react";
import { toast } from "sonner";
import { WebhookEndpointService } from "@/shared/api/services";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { WebhookEndpointDto } from "@/shared/api/types";

const integTabs = [
  { to: "/integrations/connectors", label: "Connecteurs" },
  { to: "/integrations/webhooks", label: "Webhooks" },
  { to: "/integrations/api-keys", label: "API Keys" },
  { to: "/integrations/sync-logs", label: "Logs de sync" },
];

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
  const companyId = useAuthStore((s) => s.user?.companyId);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WebhookEndpointDto | null>(
    null,
  );
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [timeoutSec, setTimeoutSec] = useState(30);
  const [maxRetries, setMaxRetries] = useState(3);

  const { data, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: () =>
      WebhookEndpointService.search({ pageNumber: 1, pageSize: 50 }) as any,
  });

  const webhooks: WebhookEndpointDto[] = data?.data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (body: Partial<WebhookEndpointDto>) =>
      WebhookEndpointService.create(body as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks"] });
      setModalOpen(false);
      toast.success("Endpoint créé");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => WebhookEndpointService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks"] });
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
      <div className="flex border-b border-[#E5E7EB] mb-6">
        {integTabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="px-4 py-2.5 text-[13px] border-b-2 border-transparent text-[#4A7A94] hover:text-[#0D2137] transition-all whitespace-nowrap"
            activeProps={{
              className: "text-[#1B5E82] font-medium !border-[#2E8FAD]",
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

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
                  <Button size="sm" variant="ghost">
                    <Settings size={12} />
                    Configurer
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
                  companyId: companyId ?? undefined,
                  url: urlInput,
                  // API: events is string | null (comma-separated); DTO type says string[] — bridge with cast
                  events: selectedEvents.join(",") as unknown as string[],
                  isActive: true,
                  timeoutSeconds: timeoutSec,
                  maxRetries,
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
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              loading={deleteMutation.isPending}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[10px]">
          <p className="text-[12.5px] text-[#DC2626]">
            Supprimer cet endpoint arrêtera toutes les livraisons en cours.
          </p>
        </div>
      </Modal>
    </div>
  );
}
