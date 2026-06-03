import { motion } from "framer-motion";
import { KPICard } from "@/components/feedback/KPICard";
import { fmt } from "@/lib/utils";
import { staggerContainer, cardItem } from "@/lib/animations";

interface DashboardKPIsProps {
  activeCompanies: number;
  companiesCount: number;
  totalMessages: number;
  totalUsers: number;
  activeProviders: number;
}

export function DashboardKPIs({
  activeCompanies,
  companiesCount,
  totalMessages,
  totalUsers,
  activeProviders,
}: DashboardKPIsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-4 gap-4 mb-6"
    >
      {[
        {
          label: "Companies actives",
          value: `${activeCompanies} / ${companiesCount}`,
          trend: "up" as const,
          trendLabel: "sur la plateforme",
        },
        {
          label: "Messages total",
          value: fmt(totalMessages),
          trend: "up" as const,
          trendLabel: "historique complet",
        },
        {
          label: "Utilisateurs",
          value: fmt(totalUsers),
          trend: "neutral" as const,
          trendLabel: "tous types",
        },
        {
          label: "Providers actifs",
          value: activeProviders,
          trend: "neutral" as const,
          trendLabel: "connectés",
        },
      ].map((k, i) => (
        <motion.div key={i} variants={cardItem}>
          <KPICard
            label={k.label}
            value={k.value}
            trend={k.trend}
            trendLabel={k.trendLabel}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
