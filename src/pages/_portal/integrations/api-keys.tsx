import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, EyeOff, Copy, Trash2, Key } from "lucide-react";
import { toast } from "sonner";
import { CompanyApiKeyService } from "@/shared/api/services";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatDate, formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { CompanyApiKeyDto } from "@/api/generated/types";

const integTabs = [
  { to: "/integrations/connectors", label: "Connecteurs" },
  { to: "/integrations/webhooks", label: "Webhooks" },
  { to: "/integrations/api-keys", label: "API Keys" },
  { to: "/integrations/sync-logs", label: "Logs de sync" },
];

const SCOPES = [
  { value: "messages:send", label: "Envoyer des messages" },
  { value: "messages:read", label: "Lire les messages" },
  { value: "contacts:read", label: "Lire les contacts" },
  { value: "contacts:write", label: "Modifier les contacts" },
  { value: "campaigns:read", label: "Lire les campagnes" },
  { value: "stats:read", label: "Accéder aux statistiques" },
];

export function ApiKeysPage() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CompanyApiKeyDto | null>(
    null,
  );
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState("");

  const resetForm = () => {
    setName("");
    setExpiresAt("");
    setIpWhitelist("");
    setSelectedScopes([]);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () =>
      CompanyApiKeyService.search({ pageNumber: 1, pageSize: 50 }) as any,
  });

  const keys: CompanyApiKeyDto[] = data?.data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      CompanyApiKeyService.create({
        companyId: companyId ?? undefined,
        name,
        scopes: selectedScopes.join(","),
        // Convert YYYY-MM-DD from date input to ISO 8601 datetime string
        expiresAt: expiresAt ? `${expiresAt}T00:00:00Z` : null,
        ipWhitelist: ipWhitelist || null,
        isActive: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      setModalOpen(false);
      resetForm();
      toast.success("Clé API créée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CompanyApiKeyService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      setDeleteTarget(null);
      toast.success("Clé révoquée");
    },
    onError: () => toast.error("Erreur lors de la révocation"),
  });

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Clé copiée dans le presse-papiers");
  };

  const expiryStatus = (
    k: CompanyApiKeyDto,
  ): "success" | "warning" | "error" | "neutral" => {
    if (!k.isActive) return "neutral";
    if (!k.expiresAt) return "success";
    const daysLeft = Math.ceil(
      (new Date(k.expiresAt).getTime() - Date.now()) / 86400000,
    );
    if (daysLeft <= 0) return "error";
    if (daysLeft <= 7) return "error";
    if (daysLeft <= 30) return "warning";
    return "success";
  };

  const expiryLabel = (k: CompanyApiKeyDto) => {
    if (!k.isActive) return "Inactive";
    if (!k.expiresAt) return "Active";
    const daysLeft = Math.ceil(
      (new Date(k.expiresAt).getTime() - Date.now()) / 86400000,
    );
    if (daysLeft <= 0) return "Expirée";
    if (daysLeft <= 30) return "Expire bientôt";
    return "Active";
  };

  if (isLoading) return <PageLoader />;

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
          {keys.length} clé{keys.length > 1 ? "s" : ""} API active
          {keys.length > 1 ? "s" : ""}
        </p>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus size={13} />
          Nouvelle clé API
        </Button>
      </div>

      {keys.length === 0 ? (
        <EmptyState
          icon={<Key size={32} />}
          title="Aucune clé API"
          description="Créez une clé API pour accéder à l'API OmniChannel"
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={13} />
              Créer une clé
            </Button>
          }
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
          {keys.map((k, i) => (
            <div
              key={k.id}
              className={cn(
                "flex items-start gap-3.5 p-4 hover:bg-[#F7F8F9] transition-colors",
                i < keys.length - 1 && "border-b border-[#E5E7EB]",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[13px] font-medium text-[#0D2137]">
                    {k.name}
                  </p>
                  <Badge variant={expiryStatus(k)}>{expiryLabel(k)}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <code className="font-mono text-[12px] text-[#2E8FAD] bg-[#E8F4F8] px-2 py-0.5 rounded">
                    {k.keyPrefix ?? "oc_live_"}
                    {revealedKeys.has(k.id)
                      ? "xxxxxxxxxxxxxxxx"
                      : "••••••••••••••••"}
                  </code>
                  <button
                    onClick={() => toggleReveal(k.id)}
                    className="text-[#8BAFC0] hover:text-[#0D2137] transition-colors cursor-pointer"
                  >
                    {revealedKeys.has(k.id) ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                  </button>
                  <button
                    onClick={() => copyKey(k.keyPrefix ?? "")}
                    className="text-[#8BAFC0] hover:text-[#0D2137] transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {(k.scopes ?? []).map((s: string) => (
                    <code
                      key={s}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F2F4] text-[#4A7A94] border border-[#E5E7EB] font-mono"
                    >
                      {s}
                    </code>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[11.5px] text-[#8BAFC0]">
                  <span>Créée le {formatDate(k.createdAt)}</span>
                  <span>·</span>
                  <span>
                    Utilisée{" "}
                    {k.lastUsedAt ? formatRelative(k.lastUsedAt) : "jamais"}
                  </span>
                  {k.expiresAt && (
                    <>
                      <span>·</span>
                      <span
                        className={cn(
                          expiryStatus(k) === "error" ? "text-[#DC2626]" : "",
                        )}
                      >
                        Expire le {formatDate(k.expiresAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="ghost" size="sm">
                  Modifier
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(k)}
                >
                  <Trash2 size={11} />
                  Révoquer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Nouvelle clé API"
        subtitle="La clé sera affichée une seule fois"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!name.trim()}
            >
              Générer la clé
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nom de la clé *"
            placeholder="ex : Production Backend"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <label className="text-[12.5px] font-medium text-[#0D2137] mb-2 block">
              Permissions (scopes)
            </label>
            <div className="flex flex-col gap-2">
              {SCOPES.map((s) => (
                <label
                  key={s.value}
                  className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#0D2137]"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(s.value)}
                    onChange={(e) =>
                      setSelectedScopes((prev) =>
                        e.target.checked
                          ? [...prev, s.value]
                          : prev.filter((v) => v !== s.value),
                      )
                    }
                    className="accent-[#2E8FAD]"
                  />
                  <code className="text-[11.5px] text-[#2E8FAD] font-mono">
                    {s.value}
                  </code>
                  <span className="text-[#4A7A94]">— {s.label}</span>
                </label>
              ))}
            </div>
          </div>
          <Input
            label="Expiration (optionnel)"
            type="date"
            hint="Laissez vide pour une clé sans expiration"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <Input
            label="Restriction IP (optionnel)"
            placeholder="ex : 197.234.x.x"
            hint="Laissez vide pour autoriser toutes les IPs."
            value={ipWhitelist}
            onChange={(e) => setIpWhitelist(e.target.value)}
          />
        </div>
      </Modal>

      {/* Revoke confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Révoquer la clé API"
        subtitle={deleteTarget?.name}
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
              Révoquer définitivement
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[10px]">
          <Trash2 size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-[#DC2626] leading-relaxed">
            Toutes les requêtes utilisant cette clé seront immédiatement
            rejetées. Cette action est irréversible.
          </p>
        </div>
      </Modal>
    </div>
  );
}
