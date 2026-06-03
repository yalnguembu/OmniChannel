import { motion } from "framer-motion";
import { Edit, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { formatCurrency } from "@/lib/currency";
import { cardItem } from "@/lib/animations";
import type { SubscriptionPlanDto } from "@/shared/api/generated/types.gen";

const PLAN_COLORS = [
  "#2E8FAD",
  "#1B5E82",
  "#E8541A",
  "#16A34A",
  "#7C3AED",
  "#D97706",
];

interface PlanCardProps {
  plan: SubscriptionPlanDto;
  onEdit: () => void;
}

export function PlanCard({ plan, onEdit }: PlanCardProps) {
  const color =
    PLAN_COLORS[(plan.name?.charCodeAt(0) ?? 0) % PLAN_COLORS.length] ??
    "#2E8FAD";
  const features = [
    plan.maxProducts ? `${plan.maxProducts} produits` : null,
    plan.monthlyQuota
      ? `${(plan.monthlyQuota / 1000).toFixed(0)}k messages/mois`
      : null,
    plan.maxUsers ? `${plan.maxUsers} utilisateurs` : null,
  ].filter(Boolean) as string[];

  return (
    <motion.div
      variants={cardItem}
      className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.10)] hover:border-[#6AB8D4]/50 duration-[220ms]"
    >
      <div
        className="h-1 shrink-0"
        style={{ background: `linear-gradient(90deg,${color},${color}99)` }}
      />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-[15px] text-[#0D2137] tracking-tight">
              {plan.name}
            </p>
            {plan.description && (
              <p className="text-[12px] text-[#8BAFC0] mt-0.5 line-clamp-1">
                {plan.description}
              </p>
            )}
          </div>
          <Badge variant={plan.isActive ? "success" : "neutral"} dot>
            {plan.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-semibold text-[#0D2137] tracking-tight">
              {formatCurrency(plan.monthlyPrice)}
            </span>
            <span className="text-[12px] text-[#8BAFC0]">/mois</span>
          </div>
          {plan.yearlyPrice && (
            <p className="text-[12px] text-[#4A7A94] mt-0.5">
              {formatCurrency(plan.yearlyPrice)}/an · économisez{" "}
              {Math.round(
                (1 - plan.yearlyPrice / ((plan.monthlyPrice ?? 0) * 12)) * 100,
              )}
              %
            </p>
          )}
        </div>

        {features.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-[12.5px] text-[#4A7A94]"
              >
                <Check size={12} className="text-[#16A34A] shrink-0" />
                {f}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] mt-auto">
          <Can perform={ACTION.SUBSCRIPTIONPLAN_EDIT}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1.5 text-[12px] text-[#4A7A94] px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#C8E8F2] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all cursor-pointer"
            >
              <Edit size={11} />
              Modifier
            </button>
          </Can>
        </div>
      </div>
    </motion.div>
  );
}
