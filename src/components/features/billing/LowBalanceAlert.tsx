import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LowBalanceAlert({ isLowBalance, onRechargeClick }: { isLowBalance: boolean, onRechargeClick: () => void }) {
  if (!isLowBalance) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[10px] mb-5"
    >
      <AlertCircle size={15} className="text-[#DC2626] shrink-0" />
      <p className="text-[12.5px] text-[#DC2626] flex-1">
        <strong>Solde bas</strong> — Votre wallet est en dessous du seuil
        minimum.
      </p>
      <Button
        variant="danger"
        size="sm"
        onClick={onRechargeClick}
      >
        Recharger maintenant
      </Button>
    </motion.div>
  );
}
