import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Copy, RefreshCw, Key } from "lucide-react";
import { toast } from "sonner";
import {
  getApiCompanyApiKeyByIdOptions,
  patchApiCompanyApiKeyRenegereByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatDate } from "@/lib/date";
import { Modal } from "@/components/ui/Modal";

const integTabs = [
  { to: "/integrations/connectors", label: "Connecteurs" },
  { to: "/integrations/webhooks", label: "Webhooks" },
  { to: "/integrations/api-keys", label: "API Keys" },
  { to: "/integrations/sync-logs", label: "Logs de sync" },
];

export function ApiKeysPage() {
  const companyId = useAuthStore((s) => s.user?.companyId);
  const [revealed, setRevealed] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    ...getApiCompanyApiKeyByIdOptions({ path: { id: companyId! } }),
    enabled: !!companyId,
  });

  const apiKey = (data as any)?.data;

  const regenMutation = useMutation({
    ...patchApiCompanyApiKeyRenegereByIdMutation(),
    onSuccess: () => {
      refetch();
      setConfirmRegen(false);
      setRevealed(false);
      toast.success("Clé API régénérée");
    },
    onError: () => toast.error("Erreur lors de la régénération"),
  });

  const copyKey = () => {
    if (!apiKey?.apiKey) return;
    navigator.clipboard.writeText(apiKey.apiKey);
    toast.success("Clé copiée dans le presse-papiers");
  };

  const expiryStatus = (): "success" | "warning" | "error" => {
    if (!apiKey?.apiKeyExpiresAtUtc) return "success";
    const daysLeft = Math.ceil(
      (new Date(apiKey.apiKeyExpiresAtUtc).getTime() - Date.now()) / 86400000,
    );
    if (daysLeft <= 0) return "error";
    if (daysLeft <= 30) return "warning";
    return "success";
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

      {!apiKey ? (
        <EmptyState
          icon={<Key size={32} />}
          title="Aucune clé API"
          description="Votre clé API n'a pas encore été provisionnée par l'administration."
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden max-w-2xl">
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={15} className="text-[#2E8FAD]" />
              <p className="text-[13px] font-medium text-[#0D2137]">
                Clé API de production
              </p>
              <Badge variant={expiryStatus()}>
                {expiryStatus() === "error"
                  ? "Expirée"
                  : expiryStatus() === "warning"
                    ? "Expire bientôt"
                    : "Active"}
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmRegen(true)}
            >
              <RefreshCw size={12} />
              Régénérer
            </Button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Key display */}
            <div>
              <p className="text-[11.5px] font-medium text-[#8BAFC0] uppercase tracking-wide mb-1.5">
                Clé secrète
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[12px] text-[#2E8FAD] bg-[#E8F4F8] px-3 py-2 rounded-[8px] truncate">
                  {revealed ? apiKey.apiKey : "oc_live_••••••••••••••••••••••••••••••••"}
                </code>
                <button
                  onClick={() => setRevealed((v) => !v)}
                  className="text-[#8BAFC0] hover:text-[#0D2137] transition-colors cursor-pointer p-1"
                  title={revealed ? "Masquer" : "Révéler"}
                >
                  {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={copyKey}
                  className="text-[#8BAFC0] hover:text-[#0D2137] transition-colors cursor-pointer p-1"
                  title="Copier"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>

            {/* Expiry */}
            {apiKey.apiKeyExpiresAtUtc && (
              <div>
                <p className="text-[11.5px] font-medium text-[#8BAFC0] uppercase tracking-wide mb-1">
                  Expiration
                </p>
                <p className="text-[13px] text-[#0D2137]">
                  {formatDate(apiKey.apiKeyExpiresAtUtc)}
                </p>
              </div>
            )}

            <p className="text-[12px] text-[#8BAFC0] bg-[#F7F8F9] px-3 py-2.5 rounded-[8px] border border-[#E5E7EB]">
              Transmettez cette clé dans le header{" "}
              <code className="font-mono text-[#2E8FAD]">Authorization: Bearer &lt;clé&gt;</code>{" "}
              de vos requêtes API. Ne la partagez jamais publiquement.
            </p>
          </div>
        </div>
      )}

      {/* Regenerate confirm */}
      <Modal
        open={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        title="Régénérer la clé API"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRegen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => regenMutation.mutate({ path: { id: companyId! } })}
              loading={regenMutation.isPending}
            >
              Régénérer
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-md">
          <RefreshCw size={15} className="text-[#D97706] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-[#92400E] leading-relaxed">
            L'ancienne clé sera immédiatement invalidée. Toutes les
            intégrations qui l'utilisent cesseront de fonctionner jusqu'à ce
            que vous mettiez à jour la clé.
          </p>
        </div>
      </Modal>
    </div>
  );
}
