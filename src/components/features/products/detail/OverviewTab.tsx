import { Radio, Pause, Play } from "lucide-react";
import type { ProductModel } from "@/models/product.model";
import { formatDate } from "@/lib/date";
import { cn, statusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DetailCard } from "./DetailCard";
import type { ProductTabId } from "./ProductDetailTabs";
import type { SearchProductChannelResponse } from "@/shared/api/generated/types.gen";

interface OverviewTabProps {
  product: ProductModel;
  channels: SearchProductChannelResponse[];
  onNavigateTab: (id: ProductTabId) => void;
  onEdit: () => void;
  onChangeStatus: (status: string) => void;
  isUpdatePending: boolean;
}

const STATUS_PILL: Record<string, string> = {
  active: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
  paused: "bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]",
  draft: "bg-[#F0F2F4] text-[#4A7A94] border-[#E5E7EB]",
  inactive: "bg-[#F0F2F4] text-[#8BAFC0] border-[#E5E7EB]",
};

function CardLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <span
      className="text-[12px] text-[#2E8FAD] cursor-pointer"
      onClick={onClick}
    >
      {label}
    </span>
  );
}

/**
 * "Vue d'ensemble" tab — merges the activity overview with the product
 * settings (general info + status actions) in a single view.
 */
export function OverviewTab({
  product,
  channels,
  onNavigateTab,
  onEdit,
  onChangeStatus,
  isUpdatePending,
}: OverviewTabProps) {
  const isActive = product.status === "active";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Canaux actifs */}
        <DetailCard
          title="Canaux actifs"
          action={
            <CardLink
              label="Configurer →"
              onClick={() => onNavigateTab("channels")}
            />
          }
          bodyClassName="p-4.5"
        >
          <div className="grid grid-cols-2 gap-2.5">
            {channels.length > 0 ? (
              channels.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "border border-[#E5E7EB] rounded-md p-3.5 flex items-center gap-3 bg-white transition-all",
                    !c.isActive && "opacity-55",
                  )}
                >
                  <div className="w-[38px] h-[38px] rounded-md bg-[#E8F4F8] border border-black/5 flex items-center justify-center shrink-0">
                    <Radio size={18} className="text-[#2E8FAD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#0D2137] truncate">
                      {(c.channelId ?? "").slice(0, 12)}
                    </div>
                    <div className="text-[11.5px] text-[#8BAFC0] mt-0.5">
                      {c.isActive ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-[#8BAFC0] text-[12px] italic">
                Aucun canal configuré
              </div>
            )}
          </div>
        </DetailCard>

        {/* Activité récente (Mock) */}
        <DetailCard title="Activité récente" bodyClassName="p-4.5 pt-1.5 flex flex-col">
          <div className="flex items-start gap-3 py-3 border-b border-[#E5E7EB] last:border-0 last:pb-0">
            <div className="flex flex-col items-center gap-0 pt-0.5">
              <div className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0"></div>
              <div className="w-px bg-[#E5E7EB] flex-1 mt-1 min-h-[20px]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] text-[#0D2137] leading-snug">
                Produit créé
              </div>
            </div>
            <div className="text-[11px] text-[#8BAFC0] shrink-0 pt-0.5">
              {formatDate(product.createdAt || "")}
            </div>
          </div>
        </DetailCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Livraison par canal (Mock) */}
        <DetailCard
          title="Livraison par canal"
          bodyClassName="px-4.5 py-0 flex flex-col justify-center h-[120px] text-center text-[#8BAFC0] text-[12.5px]"
        >
          Données indisponibles
        </DetailCard>

        {/* Top segments ciblés (Mock) */}
        <DetailCard
          title="Top segments ciblés"
          bodyClassName="px-4.5 py-0 flex flex-col justify-center h-[120px] text-center text-[#8BAFC0] text-[12.5px]"
        >
          Données indisponibles
        </DetailCard>
      </div>

      {/* Paramètres du produit (fusionnés depuis l'onglet Paramètres) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <DetailCard
          title="Informations générales"
          action={<CardLink label="Modifier" onClick={onEdit} />}
          bodyClassName="p-4.5 flex flex-col gap-0"
        >
          <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
            <div className="text-[13px] font-medium text-[#0D2137]">
              Nom du produit
            </div>
            <span className="text-[13px] text-[#4A7A94] ml-4 shrink-0 text-right">
              {product.name}
            </span>
          </div>
          <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
            <div className="text-[13px] font-medium text-[#0D2137]">
              Description
            </div>
            <span className="text-[12px] text-[#8BAFC0] leading-relaxed max-w-[260px] ml-4 text-right">
              {product.description || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#E5E7EB]">
            <div className="text-[13px] font-medium text-[#0D2137]">Statut</div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] text-[11px] font-medium border ${
                STATUS_PILL[product.status] ?? STATUS_PILL.draft
              }`}
            >
              {statusLabel(product.status)}
            </span>
          </div>
          <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
            <div className="text-[13px] font-medium text-[#0D2137]">
              UUID Produit
            </div>
            <span className="text-[13px] font-mono text-[#1B5E82] ml-4 shrink-0 text-right">
              {product.id}
            </span>
          </div>
          <div className="flex items-start justify-between py-3.5">
            <div className="text-[13px] font-medium text-[#0D2137]">
              Dernière mise à jour
            </div>
            <span className="text-[13px] text-[#4A7A94] ml-4 shrink-0 text-right">
              {formatDate(product.updatedAt || product.createdAt)}
            </span>
          </div>
        </DetailCard>

        <DetailCard
          title="Configuration avancée"
          bodyClassName="p-4.5 flex flex-col gap-0"
        >
          <div className="flex items-start justify-between py-3.5">
            <div>
              <div className="text-[13px] font-medium text-[#0D2137] mb-1">
                {isActive ? "Mettre en pause" : "Activer le produit"}
              </div>
              <div className="text-[12px] text-[#8BAFC0] leading-relaxed max-w-[360px]">
                {isActive
                  ? "Suspend les envois liés à ce produit sans le supprimer."
                  : "Réactive ce produit pour reprendre les envois."}
              </div>
            </div>
            <Button
              variant={isActive ? "danger" : "secondary"}
              size="sm"
              loading={isUpdatePending}
              onClick={() => onChangeStatus(isActive ? "paused" : "active")}
              className="ml-4 shrink-0"
            >
              {isActive ? <Pause size={13} /> : <Play size={13} />}
              {isActive ? "Mettre en pause" : "Activer"}
            </Button>
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
