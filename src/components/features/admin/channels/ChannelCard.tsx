import { motion } from "framer-motion";
import {
  Radio,
  Edit,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import { cardItem } from "@/lib/animations";
import type { ChannelDto } from "@/shared/api/generated/types.gen";

export const CH_META: Record<
  string,
  { icon: React.ElementType; bg: string; color: string; stripe: string }
> = {
  SMS: {
    icon: MessageSquare,
    bg: "#E8F4F8",
    color: "#2E8FAD",
    stripe: "linear-gradient(90deg,#2E8FAD,#6AB8D4)",
  },
  EMAIL: {
    icon: Mail,
    bg: "#EEF4FB",
    color: "#1B5E82",
    stripe: "linear-gradient(90deg,#1B5E82,#2E8FAD)",
  },
  WHATSAPP: {
    icon: MessageSquare,
    bg: "#F0FFF4",
    color: "#25D366",
    stripe: "linear-gradient(90deg,#25D366,#4ADE80)",
  },
  PUSH: {
    icon: Bell,
    bg: "#FFF0EA",
    color: "#E8541A",
    stripe: "linear-gradient(90deg,#E8541A,#F28A5F)",
  },
  TELEGRAM: {
    icon: Globe,
    bg: "#EFF7FF",
    color: "#0088CC",
    stripe: "linear-gradient(90deg,#0088CC,#6AB8D4)",
  },
  VOICE: {
    icon: Smartphone,
    bg: "#F0FFF4",
    color: "#16A34A",
    stripe: "linear-gradient(90deg,#16A34A,#4ADE80)",
  },
};
export const CH_FB = {
  icon: Radio,
  bg: "#F0F2F4",
  color: "#4A7A94",
  stripe: "linear-gradient(90deg,#4A7A94,#8BAFC0)",
};

interface ChannelCardProps {
  channel: ChannelDto;
  onEdit: (channel: ChannelDto) => void;
}

export function ChannelCard({ channel: ch, onEdit }: ChannelCardProps) {
  const meta = CH_META[ch.code?.toUpperCase() ?? ""] ?? CH_FB;
  const Icon = meta.icon;
  return (
    <motion.div
      variants={cardItem}
      className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden flex flex-col transition-all duration-[220ms] hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.10)] hover:border-[#6AB8D4]/50"
    >
      <div className="h-1 shrink-0" style={{ background: meta.stripe }} />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-[12px] border border-black/5 flex items-center justify-center shrink-0"
            style={{ background: meta.bg }}
          >
            <Icon size={20} style={{ color: meta.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-[#0D2137] tracking-tight">
              {ch.name}
            </p>
            <p className="font-mono text-[11px] text-[#8BAFC0] mt-0.5">
              {ch.code}
            </p>
          </div>
          <Badge variant={ch.isActive ? "success" : "neutral"} dot>
            {ch.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 bg-[#F7F8F9] border border-[#E5E7EB] rounded-[8px] overflow-hidden">
          {[
            { label: "Riche", ok: ch.supportsRichContent },
            { label: "Fichiers", ok: ch.supportsAttachments },
            { label: "Opt-in", ok: ch.requiresOptIn },
          ].map(({ label, ok }, i) => (
            <div
              key={label}
              className={cn(
                "py-2.5 text-center",
                i > 0 && "border-l border-[#E5E7EB]",
              )}
            >
              <p
                className={cn(
                  "text-[12px] font-semibold mb-0.5",
                  ok ? "text-[#16A34A]" : "text-[#B8CDD8]",
                )}
              >
                {ok ? "✓" : "—"}
              </p>
              <p className="text-[10px] text-[#8BAFC0] uppercase tracking-[0.04em]">
                {label}
              </p>
            </div>
          ))}
        </div>

        {ch.maxContentLength && (
          <p className="text-[12px] text-[#4A7A94]">
            Max.{" "}
            <span className="font-semibold">
              {ch.maxContentLength.toLocaleString("fr")}
            </span>{" "}
            chars
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] mt-auto">
          <span className="text-[11px] text-[#8BAFC0]">
            {formatRelative(ch.createdAt)}
          </span>
          <Can perform={ACTION.CHANNEL_EDIT}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(ch);
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
