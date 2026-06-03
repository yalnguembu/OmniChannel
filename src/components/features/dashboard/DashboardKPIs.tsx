import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Megaphone, CreditCard } from "lucide-react";
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
  isWalletLow
}: DashboardKPIsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
    >
      {[
        {
          label: "Messages envoyés",
          value: fmt(totalMessages),
          trend: "up" as const,
          trendLabel: "Volume total",
          icon: MessageSquare,
          color: "#2E8FAD",
        },
        {
          label: "Contacts uniques",
          value: fmt(totalContacts),
          trend: "up" as const,
          trendLabel: "Répertoire global",
          icon: Users,
          color: "#1B5E82",
        },
        {
          label: "Campagnes actives",
          value: activeCampaignsCount,
          trend:
            activeCampaignsCount > 0
              ? ("up" as const)
              : ("neutral" as const),
          trendLabel: `sur ${totalCampaigns} crées`,
          icon: Megaphone,
          color: "#7C3AED",
        },
        {
          label: "Solde actuel",
          value: walletBalance !== undefined
            ? formatCurrency(walletBalance, walletCurrency || 'XAF')
            : "—",
          trend: isWalletLow ? ("down" as const) : ("neutral" as const),
          trendLabel: "Disponible",
          icon: CreditCard,
          color: "#16A34A",
        },
      ].map((kpi, i) => (
        <motion.div key={i} variants={cardItem}>
          <KPICard
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            trendLabel={kpi.trendLabel}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
