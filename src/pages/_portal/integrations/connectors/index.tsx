import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, RefreshCw, Plug } from "lucide-react";
import { toast } from "sonner";
import { ConnectorService, ProviderService } from "@/shared/api/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ConnectorDto, ProviderDto } from "@/api/generated/types";
import { staggerContainer, cardItem } from "@/lib/animations";

const integTabs = [
  { to: "/integrations/connectors", label: "Connecteurs" },
  { to: "/integrations/webhooks", label: "Webhooks" },
  { to: "/integrations/api-keys", label: "API Keys" },
  { to: "/integrations/sync-logs", label: "Logs de sync" },
];

export function IntegrationConnectorsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConnectorDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["connectors"],
    queryFn: () => ConnectorService.search({ pageNumber: 1, pageSize: 50 }),
  });

  const { data: providersData } = useQuery({
    queryKey: ["providers", "dropdown"],
    queryFn: () => ProviderService.getDropdown(),
  });

  const connectors: ConnectorDto[] = data?.data?.items ?? [];
  const providers: ProviderDto[] = providersData?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ConnectorService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connectors"] });
      toast.success("Connecteur supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const stripeColors: Record<number, string> = {
    0: "linear-gradient(90deg,#F22F46,#FF7B85)",
    1: "linear-gradient(90deg,#1A82E2,#5DB3F7)",
    2: "linear-gradient(90deg,#7C3AED,#A78BFA)",
    3: "linear-gradient(90deg,#16A34A,#4ADE80)",
  };

  return (
    <div className="p-7">
      <div className="mb-2">
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Intégrations
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          Connecteurs, webhooks, API Keys & logs de synchronisation
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

      <div className="flex items-center justify-end mb-5">
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={13} />
          Nouveau connecteur
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : connectors.length === 0 ? (
        <EmptyState
          icon={<Plug size={32} />}
          title="Aucun connecteur"
          description="Connectez un provider SMS, Email ou WhatsApp"
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={13} />
              Nouveau connecteur
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-3.5"
        >
          {connectors.map((c, i) => (
            <motion.div
              key={c.id}
              variants={cardItem}
              className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden hover:border-[#6AB8D4] hover:shadow-[0_6px_20px_rgba(13,33,55,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div
                className="h-[3px]"
                style={{ background: stripeColors[i % 4] }}
              />
              <div className="p-4.5 p-[18px]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-[10px] bg-[#F7F8F9] border border-[#E5E7EB] flex items-center justify-center text-[11px] font-bold text-[#4A7A94] shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#0D2137] tracking-tight truncate">
                        {c.name}
                      </p>
                      <p className="text-[12px] text-[#8BAFC0]">
                        Provider ID : {c.providerId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.isDefault && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F4F8] text-[#1B5E82] border border-[#6AB8D4]/30">
                        Défaut
                      </span>
                    )}
                    <Badge variant={c.isActive ? "success" : "neutral"} dot>
                      {c.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 bg-[#F7F8F9] rounded-[8px] border border-[#E5E7EB] overflow-hidden mb-3">
                  {[
                    { label: "Priorité", value: c.priority ?? "—" },
                    { label: "Statut test", value: c.lastTestStatus ?? "—" },
                    {
                      label: "Dernier test",
                      value: c.lastTestAt ? formatRelative(c.lastTestAt) : "—",
                    },
                  ].map((s, j) => (
                    <div
                      key={j}
                      className={cn(
                        "px-2 py-2.5 text-center",
                        j > 0 && "border-l border-[#E5E7EB]",
                      )}
                    >
                      <p className="text-[12.5px] font-semibold text-[#0D2137] leading-none truncate">
                        {String(s.value)}
                      </p>
                      <p className="text-[10px] text-[#8BAFC0] mt-1 uppercase tracking-[0.04em]">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                  <span className="text-[11px] text-[#8BAFC0]">
                    {formatRelative(c.updatedAt ?? c.createdAt)}
                  </span>
                  <div
                    className="flex gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full border border-[#E5E7EB] hover:bg-[#E8F4F8] hover:border-[#2E8FAD]/30 hover:text-[#2E8FAD] transition-all text-[#8BAFC0] cursor-pointer">
                      <RefreshCw size={11} />
                      Tester
                    </button>
                    <button
                      onClick={() => {
                        setEditing(c);
                        setModalOpen(true);
                      }}
                      className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all border border-transparent hover:border-[#2E8FAD]/20 cursor-pointer"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-all border border-transparent hover:border-[#FCA5A5] cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add card */}
          <motion.div
            variants={cardItem}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="bg-transparent border border-dashed border-[#E5E7EB] rounded-[14px] flex flex-col items-center justify-center gap-3 p-8 cursor-pointer hover:bg-white hover:border-[#2E8FAD]/40 hover:border-solid hover:shadow-[0_4px_20px_rgba(13,33,55,0.06)] transition-all min-h-[200px]"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#F0F2F4] border border-[#E5E7EB] flex items-center justify-center">
              <Plus size={20} className="text-[#4A7A94]" />
            </div>
            <p className="text-[14px] font-medium text-[#4A7A94]">
              Nouveau connecteur
            </p>
            <p className="text-[12px] text-[#8BAFC0] text-center leading-relaxed max-w-[160px]">
              Connectez un provider SMS, Email ou WhatsApp
            </p>
          </motion.div>
        </motion.div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? `Configurer ${editing.name}` : "Nouveau connecteur"}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                toast.info(
                  "Le provisioning des connecteurs se fait via la configuration provider — contactez le support pour l'activer.",
                );
                setModalOpen(false);
                setEditing(null);
              }}
            >
              {editing ? "Enregistrer" : "Créer le connecteur"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nom du connecteur *"
            placeholder="ex : Twilio Production"
            defaultValue={editing?.name}
          />
          <Select
            label="Provider *"
            defaultValue={editing?.providerId}
            options={[
              { value: "", label: "Sélectionner un provider…" },
              ...providers.map((p: ProviderDto) => ({
                value: p.id,
                label: p.name,
              })),
            ]}
          />
          <Input
            label="Clé API / Account SID *"
            placeholder="Votre identifiant provider"
          />
          <Input
            label="Auth Token / Secret *"
            type="password"
            placeholder="••••••••••••"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priorité"
              options={[
                { value: "1", label: "1 — Primaire" },
                { value: "2", label: "2 — Secondaire" },
                { value: "3", label: "3 — Fallback" },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
