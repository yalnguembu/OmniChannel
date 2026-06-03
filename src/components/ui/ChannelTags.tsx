import React from "react";
import { cn } from "@/lib/utils";

/* ─── Channel tag resolution (label + dot color by channel type) ──── */

const CHANNEL_LABEL: Record<string, string> = {
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
  push: "Push",
};

const CHANNEL_DOT: Record<string, string> = {
  sms: "#2E8FAD",
  email: "#0D2137",
  whatsapp: "#16A34A",
  push: "#E8541A",
};

export interface ChannelLike {
  /** Channel type/code (sms, email, whatsapp, push…). */
  type?: string | null;
  /** Fallback display name when the type is unknown. */
  name?: string | null;
}

export function getChannelTag(type?: string | null, name?: string | null) {
  const key = (type ?? "").toLowerCase();
  return {
    label: CHANNEL_LABEL[key] ?? name ?? type ?? "Canal",
    dot: CHANNEL_DOT[key] ?? "#8BAFC0",
  };
}

interface ChannelTagsProps {
  channels: ChannelLike[];
  emptyLabel?: string;
  className?: string;
}

/**
 * Renders a deduped row of channel chips (colored dot + label).
 * Shared by ProductCard and CampaignCard for visual coherence.
 */
export function ChannelTags({
  channels,
  emptyLabel = "Aucun canal configuré",
  className,
}: ChannelTagsProps) {
  const seen = new Set<string>();
  const tags: { label: string; dot: string }[] = [];
  for (const ch of channels) {
    const tag = getChannelTag(ch.type, ch.name);
    if (seen.has(tag.label)) continue;
    seen.add(tag.label);
    tags.push(tag);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-[6px] flex-wrap min-h-[22px]",
        className,
      )}
    >
      {tags.length > 0 ? (
        tags.map((tag) => (
          <span
            key={tag.label}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#4A7A94] bg-[#F7F8F9] border-[0.5px] border-[#E5E7EB] px-2.5 py-[3px] rounded-full"
          >
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: tag.dot }}
            />
            {tag.label}
          </span>
        ))
      ) : (
        <span className="text-[11px] text-[#8BAFC0]">{emptyLabel}</span>
      )}
    </div>
  );
}
