import { motion } from "framer-motion";
import { KPICard } from "@/components/feedback/KPICard";
import { formatCurrency } from "@/lib/currency";
import { fmt } from "@/lib/utils";
import { staggerContainer, cardItem } from "@/lib/animations";

interface DashboardKPIsProps {
  totalMessages: number;
  totalContacts: number;
  activeCampaignsCount: number;
  totalCampaigns: number;
  walletBalance?: number;
  walletCurrency?: string;
  isWalletLow: boolean;
}

export function DashboardKPIs({
  totalMessages,
  totalContacts,
  activeCampaignsCount,
  totalCampaigns,
  walletBalance,
  walletCurrency,
  isWalletLow,
}: DashboardKPIsProps) {
  // No time-series endpoint exists, so KPIs show an honest caption rather than a
  // fabricated up/down trend. The only real signal we can compute is a low wallet
  // balance, which surfaces as a genuine "down" state.
  const kpis = [
    {
      label: "Messages envoyés",
      value: fmt(totalMessages),
      caption: "Volume total",
    },
    {
      label: "Contacts uniques",
      value: fmt(totalContacts),
      caption: "Répertoire global",
    },
    {
      label: "Campagnes actives",
      value: fmt(activeCampaignsCount),
      caption: `sur ${fmt(totalCampaigns)} créées`,
    },
    {
      label: "Solde actuel",
      value:
        walletBalance !== undefined
          ? formatCurrency(walletBalance, walletCurrency || "XAF")
          : "—",
      caption: isWalletLow ? "Solde bas" : "Disponible",
      trend: isWalletLow ? ("down" as const) : undefined,
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {kpis.map((kpi, i) => (
        <motion.div key={i} variants={cardItem}>
          <KPICard
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            trendLabel={kpi.caption}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
