import {
  Package,
  BarChart2,
  Radio,
  Plug,
  Users,
  Megaphone,
  FileText,
  Database,
  Activity,
  Workflow,
  Filter,
  Bot,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductTabId =
  | "overview"
  | "contacts"
  | "campaigns"
  | "templates"
  | "channels"
  | "connectors"
  | "schema"
  | "stats"
  | "events"
  | "flows"
  | "funnels"
  | "auto-reply";

interface TabDef {
  id: ProductTabId;
  label: string;
  icon: LucideIcon;
}

export const PRODUCT_TABS: TabDef[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Package },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "campaigns", label: "Campagnes", icon: Megaphone },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "channels", label: "Canaux", icon: Radio },
  { id: "connectors", label: "Connecteurs", icon: Plug },
  { id: "schema", label: "Attributs", icon: Database },
  { id: "stats", label: "Statistiques", icon: BarChart2 },
  { id: "events", label: "Événements", icon: Activity },
  { id: "flows", label: "Flux", icon: Workflow },
  { id: "funnels", label: "Funnels", icon: Filter },
  { id: "auto-reply", label: "Auto-réponses", icon: Bot },
];

interface ProductDetailTabsProps {
  activeTab: string;
  onTabChange: (id: ProductTabId) => void;
  channelsCount: number;
  connectorsCount: number;
}

/** Sticky tab navigation bar with count badges for channels/connectors. */
export function ProductDetailTabs({
  activeTab,
  onTabChange,
  channelsCount,
  connectorsCount,
}: ProductDetailTabsProps) {
  return (
    <div className="flex gap-0 bg-white border-b border-[#E5E7EB] px-7 sticky top-0 z-10">
      {PRODUCT_TABS.map((t) => {
        const isActive = activeTab === t.id;
        const hasBadge = t.id === "channels" || t.id === "connectors";
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-[13px] transition-all cursor-pointer whitespace-nowrap border-b-2",
              isActive
                ? "text-[#1B5E82] font-medium border-[#2E8FAD]"
                : "text-[#4A7A94] font-normal border-transparent hover:text-[#0D2137]",
            )}
          >
            {t.label}
            {hasBadge && (
              <span
                className={cn(
                  "text-[10.5px] font-medium px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-[#E8F4F8] text-[#1B5E82]"
                    : "bg-[#F0F2F4] text-[#4A7A94]",
                )}
              >
                {t.id === "channels" ? channelsCount : connectorsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
