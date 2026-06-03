import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";

export function DashboardAlerts({
  isWalletLow,
  balance,
  currency,
  onRecharge,
}: {
  isWalletLow: boolean;
  balance: number;
  currency: string;
  onRecharge: () => void;
}) {
  return (
    <AnimatePresence>
      {isWalletLow && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-4 p-5 bg-[#FFFBEB] border border-[#FCD34D] rounded shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#FCD34D]/20 flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-[#D97706]" />
            </div>
            <div className="flex-1">
              <p className="text-[14.5px] font-bold text-[#92400E]">
                Attention : Solde Wallet Bas
              </p>
              <p className="text-[13px] text-[#D97706] mt-0.5 font-medium">
                Votre solde actuel est de{" "}
                <strong>{formatCurrency(balance, currency)}</strong>. Rechargez
                pour éviter une interruption de vos campagnes.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="bg-[#D97706] hover:bg-[#B45309] border-none shadow-md"
              onClick={onRecharge}
            >
              Recharger maintenant
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
