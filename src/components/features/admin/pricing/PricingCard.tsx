import { motion } from "framer-motion";
import { Edit, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { formatCurrency } from "@/lib/currency";
import { cardItem } from "@/lib/animations";
import type { PricingDto } from "@/shared/api/generated/types.gen";

interface PricingCardProps {
  pricing: PricingDto;
  onEdit: () => void;
}

export function PricingCard({ pricing: p, onEdit }: PricingCardProps) {
  return (
    <motion.div
      variants={cardItem}
      className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 flex items-center gap-3 transition-all hover:shadow-[0_4px_16px_rgba(13,33,55,0.08)] hover:border-[#6AB8D4]/50 duration-[200ms]"
    >
      <div className="w-10 h-10 rounded-[10px] bg-[#E8F4F8] flex items-center justify-center shrink-0">
        <DollarSign size={16} className="text-[#2E8FAD]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-semibold text-[#2E8FAD]">
            {p.channelId ?? "—"}
          </span>
          {p.providerId && (
            <span className="font-mono text-[11.5px] text-[#8BAFC0]">
              · {p.providerId}
            </span>
          )}
          {!p.companyId && (
            <Badge variant="info" className="text-[10px]">
              Global
            </Badge>
          )}
        </div>
        <p className="text-[12px] text-[#8BAFC0] mt-0.5">
          {p.companyId ? "Company spécifique" : "Toutes les companies"}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-[15px] text-[#0D2137]">
          {p.unitPrice != null ? formatCurrency(p.unitPrice) : "—"}
        </p>
        {p.platformFee && (
          <p className="text-[11px] text-[#8BAFC0]">
            +{formatCurrency(p.platformFee)} setup
          </p>
        )}
      </div>
      <Can perform={ACTION.PRICING_EDIT}>
        <button
          onClick={onEdit}
          className="text-[#8BAFC0] hover:text-[#2E8FAD] p-1 rounded transition-colors cursor-pointer"
        >
          <Edit size={14} />
        </button>
      </Can>
    </motion.div>
  );
}
