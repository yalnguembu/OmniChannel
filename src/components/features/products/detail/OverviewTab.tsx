import { Radio } from "lucide-react";
import type { ProductModel } from "@/models/product.model";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { DetailCard } from "./DetailCard";
import type { ProductTabId } from "./ProductDetailTabs";

interface OverviewTabProps {
  product: ProductModel;
  channels: any[];
  onNavigateTab: (id: ProductTabId) => void;
}

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

/** "Vue d'ensemble" tab: active channels, recent activity and product info. */
export function OverviewTab({
  product,
  channels,
  onNavigateTab,
}: OverviewTabProps) {
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
                    "border border-[#E5E7EB] rounded-[10px] p-3.5 flex items-center gap-3 bg-white transition-all",
                    !c.isActive && "opacity-55",
                  )}
                >
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-[#E8F4F8] border border-black/5 flex items-center justify-center shrink-0">
                    <Radio size={18} className="text-[#2E8FAD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#0D2137] truncate">
                      {c.channelId.slice(0, 12)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
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

        {/* Infos produit */}
        <DetailCard
          title="Infos produit"
          action={
            <CardLink
              label="Modifier →"
              onClick={() => onNavigateTab("settings")}
            />
          }
          bodyClassName="p-4.5"
        >
          <div className="flex items-start justify-between py-2.5 border-b border-[#E5E7EB]">
            <span className="text-[12px] text-[#8BAFC0]">Description</span>
            <span className="text-[12.5px] text-[#0D2137] text-right max-w-[200px]">
              {product.description || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-[#E5E7EB]">
            <span className="text-[12px] text-[#8BAFC0]">Statut</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
              Actif
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[12px] text-[#8BAFC0]">Fuseau horaire</span>
            <span className="text-[12.5px] text-[#0D2137]">Africa/Douala</span>
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
