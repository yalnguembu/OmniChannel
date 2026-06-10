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
  // No time-series endpoint, so each KPI carries an honest caption instead of a
  // fabricated up/down trend.
  const kpis = [
    {
      label: "Companies actives",
      value: `${fmt(activeCompanies)} / ${fmt(companiesCount)}`,
      caption: "sur la plateforme",
    },
    {
      label: "Messages total",
      value: fmt(totalMessages),
      caption: "historique complet",
    },
    { label: "Utilisateurs", value: fmt(totalUsers), caption: "tous types" },
    {
      label: "Providers actifs",
      value: fmt(activeProviders),
      caption: "connectés",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-4 gap-4 mb-6"
    >
      {kpis.map((k, i) => (
        <motion.div key={i} variants={cardItem}>
          <KPICard label={k.label} value={k.value} trendLabel={k.caption} />
        </motion.div>
      ))}
    </motion.div>
  );
}
