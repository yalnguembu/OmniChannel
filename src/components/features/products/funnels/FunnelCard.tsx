import { useNavigate } from "@tanstack/react-router";
import { Filter, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFunnelSteps } from "@/hooks/useFunnelSteps";
import type { EventFunnelDto } from "@/shared/api/generated/types.gen";

interface FunnelCardProps {
  productId: string;
  funnel: EventFunnelDto;
  onEdit: () => void;
  onDelete: () => void;
}

export function FunnelCard({ productId, funnel, onEdit, onDelete }: FunnelCardProps) {
  const navigate = useNavigate();
  const { steps } = useFunnelSteps(funnel.id);
  const isActive = funnel.isActive ?? true;

  return (
    <div
      className="bg-white border-[0.5px] border-[#E5E7EB] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(13,33,55,0.09)] hover:border-[#6AB8D4] group relative"
      onClick={() =>
        navigate({
          to: "/$productId/funnels/$funnelId",
          params: { productId, funnelId: funnel.id ?? "" },
        })
      }
    >
      <div className="h-[5px] w-full" style={{ background: isActive ? "#2E8FAD" : "#DDE4EA" }} />

      <div className="px-[18px] pt-[18px] pb-[14px]">
        <div className="flex items-start justify-between mb-[14px]">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 border-[0.5px] border-[#E5E7EB]"
              style={{ background: "#E8F4F8" }}
            >
              <Filter size={18} className="text-[#2E8FAD]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#0D2137] tracking-[-0.01em] leading-[1.3] mb-[3px] truncate">
                {funnel.name || "Sans nom"}
              </p>
              <p className="text-[10.5px] font-mono text-[#8BAFC0] truncate">{funnel.code}</p>
            </div>
          </div>

          {!isActive && (
            <span className="inline-flex items-center px-2 py-[3px] rounded-[5px] text-[10.5px] font-medium bg-[#FEF3C7] text-[#D97706] flex-shrink-0 ml-2">
              Inactif
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 bg-[#F0F2F4] rounded-[8px] overflow-hidden mb-[14px]">
          <div className="py-[10px] text-center">
            <p className="text-[14px] font-medium text-[#0D2137] tracking-[-0.015em] leading-none tabular-nums">
              {steps.length}
            </p>
            <p className="text-[10px] text-[#8BAFC0] mt-[3px] uppercase tracking-[0.04em]">
              Étape{steps.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-end pt-3 border-t-[0.5px] border-[#E5E7EB]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={cn("flex gap-[6px]")}>
            <button
              onClick={onEdit}
              title="Modifier"
              className="w-[26px] h-[26px] rounded-[6px] border-[0.5px] border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:border-[#6AB8D4] hover:text-[#2E8FAD] transition-all"
            >
              <Edit size={13} />
            </button>
            <button
              onClick={onDelete}
              title="Supprimer"
              className="w-[26px] h-[26px] rounded-[6px] border-[0.5px] border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:bg-[#FEE2E2] hover:border-[#DC2626]/30 hover:text-[#DC2626] transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
