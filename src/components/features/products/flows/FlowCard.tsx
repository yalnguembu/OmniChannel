import { Workflow, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowDto } from "@/shared/api/generated/types.gen";

interface FlowCardProps {
  flow: FlowDto;
  senderName: string;
  onEdit: () => void;
  onDelete: () => void;
}

const statusStyle: Record<string, { badge: string; bar: string }> = {
  Published: { badge: "bg-[#ECFDF5] text-[#059669]", bar: "#059669" },
  Draft: { badge: "bg-[#FFFBEB] text-[#D97706]", bar: "#D97706" },
  Deprecated: { badge: "bg-[#F3F4F6] text-[#6B7280]", bar: "#DDE4EA" },
};

export function FlowCard({ flow, senderName, onEdit, onDelete }: FlowCardProps) {
  const st = statusStyle[flow.status ?? "Draft"] ?? statusStyle.Draft;

  return (
    <div
      className="bg-white border-[0.5px] border-[#E5E7EB] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(13,33,55,0.09)] hover:border-[#6AB8D4] group relative"
      onClick={onEdit}
    >
      <div className="h-[5px] w-full" style={{ background: st.bar }} />

      <div className="px-[18px] pt-[18px] pb-[14px]">
        <div className="flex items-start justify-between mb-[14px]">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 border-[0.5px] border-[#E5E7EB]"
              style={{ background: "#F0F2F4" }}
            >
              <Workflow size={18} className="text-[#4A7A94]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#0D2137] tracking-[-0.01em] leading-[1.3] mb-[3px] truncate">
                {flow.name || "Sans nom"}
              </p>
              <p className="text-[10.5px] font-mono text-[#8BAFC0] truncate">{flow.code}</p>
            </div>
          </div>

          <span className={cn("inline-flex items-center px-2 py-[3px] rounded-[5px] text-[10.5px] font-medium flex-shrink-0 ml-2", st.badge)}>
            {flow.status === "Published" ? "Publié" : flow.status === "Deprecated" ? "Déprécié" : "Brouillon"}
          </span>
        </div>

        <div className="text-[12px] text-[#8BAFC0] space-y-1 mb-[14px]">
          <p>Sender : {senderName}</p>
          {flow.provider && <p>Provider : {flow.provider}</p>}
          {flow.flowAction && <p>Action : {flow.flowAction}</p>}
        </div>

        <div
          className="flex items-center justify-end pt-3 border-t-[0.5px] border-[#E5E7EB]"
          onClick={(e) => e.stopPropagation()}
        >
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
