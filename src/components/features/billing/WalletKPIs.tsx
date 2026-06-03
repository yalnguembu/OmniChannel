import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { staggerContainer, cardItem } from "@/lib/animations";
import type { WalletDto } from "@/api/generated/types";

export function WalletKPIs({ wallet }: { wallet?: WalletDto }) {
  const currency = wallet?.currency ?? "XAF";
  const kpis = [
    {
      label: "Solde disponible",
      value: wallet ? formatCurrency(wallet.balance ?? 0, currency) : "—",
      sub: wallet?.isBlocked ? "Wallet bloqué" : "Wallet actif",
      tone: wallet?.isBlocked ? ("error" as const) : ("ok" as const),
    },
    {
      label: "Seuil d'alerte",
      value: wallet
        ? formatCurrency(wallet.lowBalanceThreshold ?? 0, currency)
        : "—",
      sub: "Notification email sous ce seuil",
      tone: "neutral" as const,
    },
    {
      label: "Solde minimum",
      value: wallet
        ? formatCurrency(wallet.minimumBalance ?? 0, currency)
        : "—",
      sub: "Blocage automatique sous ce solde",
      tone: "neutral" as const,
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-3 gap-4 mb-6"
    >
      {kpis.map((kpi, i) => (
        <motion.div
          key={i}
          variants={cardItem}
          className="bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px] px-4 py-3.5"
        >
          <p className="text-[11px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
            {kpi.label}
          </p>
          <p className="text-[20px] font-semibold text-[#0D2137] leading-none tracking-tight">
            {kpi.value}
          </p>
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] mt-1.5",
              kpi.tone === "error"
                ? "text-[#DC2626]"
                : kpi.tone === "ok"
                  ? "text-[#16A34A]"
                  : "text-[#8BAFC0]",
            )}
          >
            {kpi.tone === "error" ? (
              <ShieldAlert size={10} />
            ) : kpi.tone === "ok" ? (
              <ShieldCheck size={10} />
            ) : null}
            {kpi.sub}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
