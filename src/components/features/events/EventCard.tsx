import { useNavigate } from "@tanstack/react-router";
import { Activity, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/date";
import { useEventTriggers } from "@/hooks/useEventTriggers";
import type { EventDefinitionDto } from "@/shared/api/generated/types.gen";

interface EventCardProps {
  productId: string;
  event: EventDefinitionDto;
  onEdit: () => void;
  onDelete: () => void;
}

const originStyle: Record<string, { badge: string; iconBg: string; iconColor: string; bar: string }> = {
  Internal: {
    badge: "bg-[#E8F4F8] text-[#1B5E82]",
    iconBg: "#E8F4F8",
    iconColor: "#2E8FAD",
    bar: "#2E8FAD",
  },
  External: {
    badge: "bg-[#EDE9FE] text-[#7C3AED]",
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    bar: "#7C3AED",
  },
};

export function EventCard({ productId, event, onEdit, onDelete }: EventCardProps) {
  const navigate = useNavigate();
  const st = originStyle[event.origin ?? "Internal"] ?? originStyle.Internal;
  const { triggers } = useEventTriggers(event.id);

  return (
    <div
      className="bg-white border-[0.5px] border-[#E5E7EB] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(13,33,55,0.09)] hover:border-[#6AB8D4] group relative"
      onClick={() =>
        navigate({
          to: "/$productId/events/$eventId",
          params: { productId, eventId: event.id ?? "" },
        })
      }
    >
      <div
        className="h-[5px] w-full"
        style={{ background: event.isActive ? st.bar : "#DDE4EA" }}
      />

      <div className="px-[18px] pt-[18px] pb-[14px]">
        <div className="flex items-start justify-between mb-[14px]">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 border-[0.5px] border-[#E5E7EB]"
              style={{ background: st.iconBg }}
            >
              <Activity size={18} style={{ color: st.iconColor }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#0D2137] tracking-[-0.01em] leading-[1.3] mb-[3px] truncate">
                {event.label || "Événement sans nom"}
              </p>
              <p className="text-[10.5px] font-mono text-[#8BAFC0] truncate">
                {event.code}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
            <span className={cn("inline-flex items-center px-2 py-[3px] rounded-[5px] text-[10.5px] font-medium", st.badge)}>
              {event.origin}
            </span>
            {!event.isActive && (
              <span className="inline-flex items-center px-2 py-[3px] rounded-[5px] text-[10.5px] font-medium bg-[#FEF3C7] text-[#D97706]">
                Inactif
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 bg-[#F0F2F4] rounded-[8px] overflow-hidden mb-[14px]">
          <div className="py-[10px] text-center">
            <p className="text-[14px] font-medium text-[#0D2137] tracking-[-0.015em] leading-none tabular-nums">
              {triggers.length}
            </p>
            <p className="text-[10px] text-[#8BAFC0] mt-[3px] uppercase tracking-[0.04em]">
              Trigger{triggers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-3 border-t-[0.5px] border-[#E5E7EB]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] text-[#8BAFC0]">
            {formatRelative(event.updatedAt ?? event.createdAt)}
          </span>

          <div className="flex gap-[6px]">
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
