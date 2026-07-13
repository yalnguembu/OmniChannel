import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils";

interface ProductKpiBarProps {
  activeChannelsCount: number;
  connectorsCount: number;
  deliveryRate: number;
  totalDelivered: number;
}

interface Kpi {
  label: string;
  value: ReactNode;
  trend: string;
  /** Tailwind text color for the trend line. */
  trendColor: string;
  /** Rotation class applied to the trend arrow. */
  arrowRotation: string;
}

function ProductKpiItem({
  kpi,
  withDivider,
  withPadding,
}: {
  kpi: Kpi;
  withDivider: boolean;
  withPadding: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-w-[130px] py-3.5 flex flex-col gap-1",
        withDivider && "border-r border-[#E5E7EB]",
        withPadding && "pl-4 sm:pl-6",
      )}
    >
      <div className="text-[11px] font-medium text-[#8BAFC0] uppercase tracking-[0.06em]">
        {kpi.label}
      </div>
      <div className="text-[22px] font-semibold text-[#0D2137] tracking-tight leading-none">
        {kpi.value}
      </div>
      <div
        className={cn("text-[11px] flex items-center gap-1 mt-1", kpi.trendColor)}
      >
        <ArrowLeft size={11} className={kpi.arrowRotation} /> {kpi.trend}
      </div>
    </div>
  );
}

/** Horizontal KPI strip rendered under the hero. */
export function ProductKpiBar({
  activeChannelsCount,
  connectorsCount,
  deliveryRate,
  totalDelivered,
}: ProductKpiBarProps) {
  const kpis: Kpi[] = [
    {
      label: "Canaux actifs",
      value: fmt(activeChannelsCount),
      trend: "+1 cette semaine",
      trendColor: "text-[#16A34A]",
      arrowRotation: "rotate-90",
    },
    {
      label: "Connecteurs",
      value: fmt(connectorsCount),
      trend: "Stable",
      trendColor: "text-[#8BAFC0]",
      arrowRotation: "rotate-180",
    },
    {
      label: "Taux de livraison",
      value: `${deliveryRate}%`,
      trend: "Optimal",
      trendColor: "text-[#16A34A]",
      arrowRotation: "rotate-90",
    },
    {
      label: "Livrés",
      value: fmt(totalDelivered),
      trend: "+18% ce mois",
      trendColor: "text-[#16A34A]",
      arrowRotation: "rotate-90",
    },
    {
      label: "Coût estimé",
      value: (
        <>
          — <span className="text-[13px] font-normal text-[#8BAFC0]">XAF</span>
        </>
      ),
      trend: "Données manquantes",
      trendColor: "text-[#D97706]",
      arrowRotation: "-rotate-90",
    },
  ];

  return (
    <div className="flex items-stretch gap-0 border-t border-[#E5E7EB] -mx-4 px-4 sm:-mx-7 sm:px-7 overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {kpis.map((kpi, i) => (
        <ProductKpiItem
          key={kpi.label}
          kpi={kpi}
          withDivider={i < kpis.length - 1}
          withPadding={i > 0}
        />
      ))}
    </div>
  );
}
