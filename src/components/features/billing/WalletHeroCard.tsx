import React from "react";
import { motion } from "framer-motion";
import { Settings, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatRelative } from "@/lib/date";
import { fadeInUp } from "@/lib/animations";

export function WalletHeroCard({ wallet, onSettingsClick, onRechargeClick }: { wallet?: any, onSettingsClick: () => void, onRechargeClick: () => void }) {
  return (
    <motion.div
      {...fadeInUp}
      className="rounded-[20px] p-7 text-white relative overflow-hidden mb-5"
      style={{
        background: "linear-gradient(135deg, #0D2137 0%, #1B3A60 100%)",
      }}
    >
      <div className="absolute right-[-40px] top-[-40px] w-[240px] h-[240px] rounded-full border border-white/6 pointer-events-none" />
      <div className="absolute right-[20px] bottom-[-60px] w-[180px] h-[180px] rounded-full border border-white/4 pointer-events-none" />

      <p className="text-[11px] font-medium text-white/50 uppercase tracking-[0.1em] mb-2">
        Solde disponible
      </p>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-[40px] font-semibold leading-none tracking-tight">
          {wallet ? wallet.balance.toLocaleString("fr-FR") : "—"}
        </p>
        <span className="text-[18px] font-light text-white/60">
          {wallet?.currency ?? "XAF"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
        <span className="text-[12.5px] text-white/70">
          Wallet actif · Mis à jour{" "}
          {wallet
            ? formatRelative(wallet.updatedAt ?? wallet.createdAt)
            : "—"}
        </span>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-white/10">
        <div className="flex gap-8">
          {[
            {
              label: "Seuil minimum",
              value: formatCurrency(
                wallet?.minimumBalance ?? 0,
                wallet?.currency,
              ),
            },
            {
              label: "Seuil d'alerte",
              value: formatCurrency(
                wallet?.lowBalanceThreshold ?? 0,
                wallet?.currency,
              ),
            },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[20px] font-semibold text-white">
                {s.value}
              </p>
              <p className="text-[11px] text-white/45 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 text-white/90 border border-white/20 text-[13px] hover:bg-white/18 transition-all cursor-pointer"
          >
            <Settings size={13} />
            Paramètres
          </button>
          <button
            onClick={onRechargeClick}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E8541A] text-white text-[13px] font-medium shadow-[0_3px_12px_rgba(232,84,26,0.35)] hover:bg-[#D44814] transition-all cursor-pointer"
          >
            <ArrowUpRight size={13} />
            Recharger le wallet
          </button>
        </div>
      </div>
    </motion.div>
  );
}
