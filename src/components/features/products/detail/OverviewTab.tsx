import { Radio, ChevronRight } from "lucide-react";
import type { ProductModel } from "@/models/product.model";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { DetailCard } from "./DetailCard";
import { PRODUCT_TABS, type ProductTabId } from "./ProductDetailTabs";
import type { SearchProductChannelResponse } from "@/shared/api/generated/types.gen";

interface OverviewTabProps {
  product: ProductModel;
  channels: SearchProductChannelResponse[];
  onNavigateTab: (id: ProductTabId) => void;
}

function CardLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <span className="text-[12px] text-[#2E8FAD] cursor-pointer" onClick={onClick}>
      {label}
    </span>
  );
}

/** Sections surfaced as quick links (everything but the overview itself). */
const QUICK_LINKS = PRODUCT_TABS.filter((t) => t.id !== "overview");

/**
 * "Vue d'ensemble" — activity snapshot (channels + recent activity) plus quick
 * links to every product section. Statistics live in the dedicated stats
 * section above; product settings are edited from the hero.
 */
export function OverviewTab({
  product,
  channels,
  onNavigateTab,
}: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Accès rapides */}
      <DetailCard title="Accès rapides" bodyClassName="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {QUICK_LINKS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onNavigateTab(t.id)}
                className="group flex items-center gap-3 p-3 rounded-[12px] border border-[#E5E7EB] bg-white text-left transition-all hover:border-[#2E8FAD]/45 hover:bg-[#F7FBFC] hover:shadow-[0_2px_10px_rgba(46,143,173,0.08)]"
              >
                <span className="w-9 h-9 rounded-[10px] bg-[#E8F4F8] text-[#2E8FAD] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#2E8FAD] group-hover:text-white">
                  <Icon size={16} />
                </span>
                <span className="flex-1 min-w-0 text-[13px] font-medium text-[#0D2137] truncate">
                  {t.label}
                </span>
                <ChevronRight
                  size={15}
                  className="text-[#C3D2DA] shrink-0 transition-all group-hover:text-[#2E8FAD] group-hover:translate-x-0.5"
                />
              </button>
            );
          })}
        </div>
      </DetailCard>

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

        {/* Activité récente */}
        <DetailCard
          title="Activité récente"
          bodyClassName="p-4.5 pt-1.5 flex flex-col"
        >
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
    </div>
  );
}
