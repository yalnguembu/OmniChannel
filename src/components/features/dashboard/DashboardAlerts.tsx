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
          <div className="flex items-center gap-3 p-4 bg-[#FFFBEB] border border-[#FCD34D] rounded-[12px]">
            <AlertCircle size={15} className="text-[#D97706] shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[#92400E]">
                Solde wallet bas
              </p>
              <p className="text-[12px] text-[#D97706] mt-0.5">
                Votre solde actuel est de{" "}
                <strong>{formatCurrency(balance, currency)}</strong>. Rechargez
                pour éviter une interruption de vos campagnes.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="bg-[#D97706] hover:bg-[#B45309] border-none shrink-0"
              onClick={onRecharge}
            >
              Recharger
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
