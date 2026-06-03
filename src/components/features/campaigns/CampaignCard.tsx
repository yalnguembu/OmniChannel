import React from "react";
import { motion } from "framer-motion";
import { BarChart2, Copy, MoreHorizontal, AlignLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { ChannelTags, type ChannelLike } from "@/components/ui/ChannelTags";
import { statusLabel, cn } from "@/lib/utils";
import { formatRelative } from "@/lib/date";
import { cardItem } from "@/lib/animations";
import { ChannelService } from "@/shared/api/services";
import { postApiCampaignChannelSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { CampaignModel } from "@/models/campaign.model";

const typeLabel: Record<string, string> = {
  standard: "Standard",
  ai: "IA · Automatique",
  trigger: "Déclenché",
  recurring: "Récurrent",
};

const typeColor: Record<string, string> = {
  standard: "#2E8FAD",
  ai: "#7C3AED",
  trigger: "#16A34A",
  recurring: "#D97706",
};

const stripeGradient: Record<string, string> = {
  standard: "linear-gradient(90deg,#2E8FAD,#6AB8D4)",
  ai: "linear-gradient(90deg,#7C3AED,#A78BFA)",
  trigger: "linear-gradient(90deg,#16A34A,#4ADE80)",
  recurring: "linear-gradient(90deg,#D97706,#FCD34D)",
};

interface CampaignCardProps {
  campaign: CampaignModel;
  onEdit?: (id: string) => void;
  onDuplicate?: (c: CampaignModel) => void;
  onDelete?: (id: string) => void;
}

export function CampaignCard({
  campaign,
  onEdit,
  onDuplicate,
  onDelete,
}: CampaignCardProps) {
  const navigate = useNavigate();
  const type = campaign.type || "standard";

  const statusVariant = (
    s: string,
  ): "success" | "warning" | "neutral" | "error" => {
    if (s === "active") return "success";
    if (s === "scheduled") return "warning";
    if (s === "completed") return "success";
    if (s === "paused") return "warning";
    return "neutral";
  };

  const isDraft = campaign.status === "draft";

  /* ── Real delivery metrics ──────────────────────────────────────── */
  const sent = campaign.successfulSends + campaign.failedSends; // envoyés (tentés)
  const delivered = campaign.successfulSends; // livrés
  const deliveryRate =
    sent > 0 ? Math.round((delivered / sent) * 1000) / 10 : 0; // taux %
  const progression =
    campaign.totalRecipients > 0
      ? Math.min(Math.round((sent / campaign.totalRecipients) * 100), 100)
      : 0;

  /* ── Channels: campaign-channel links cross-referenced with dropdown ── */
  const { data: campChannelsData } = useQuery({
    ...postApiCampaignChannelSearchOptions({
      body: { campaignId: campaign.id, pageNumber: 1, pageSize: 50 } as any,
    }),
    select: (res: any) => res?.data?.items ?? [],
    enabled: !!campaign.id,
    staleTime: 2 * 60 * 1000,
  });
  const campChannels: any[] = campChannelsData ?? [];

  // Shared queryKey → deduped to one request across all cards on the grid.
  const { data: channelsData } = useQuery({
    queryKey: ["channels", "dropdown"],
    queryFn: () => ChannelService.getDropdown() as any,
    staleTime: 5 * 60 * 1000,
  });
  const allChannels: any[] = channelsData?.data ?? [];

  const channels = React.useMemo<ChannelLike[]>(
    () =>
      campChannels.map((cc) => {
        const ch = allChannels.find((c) => c.id === cc.channelId);
        return { type: ch?.type ?? ch?.code, name: ch?.name };
      }),
    [campChannels, allChannels],
  );

  return (
    <motion.div
      variants={cardItem}
      layout
      className="bg-white border border-[#E5E7EB]/80 rounded-[20px] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.1)] hover:border-[#6AB8D4]/50 transition-all duration-220 group"
      onClick={() =>
        navigate({
          to: "/campaigns/$campaignId",
          params: { campaignId: campaign.id },
        })
      }
    >
      <div className="h-1" style={{ background: stripeGradient[type] }} />
      <div className="p-5">
        {/* Head */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center shrink-0 border border-black/5 group-hover:scale-110 transition-transform"
              style={{ background: typeColor[type] + "12" }}
            >
              <AlignLeft size={20} style={{ color: typeColor[type] }} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-[#0D2137] tracking-tight truncate leading-tight group-hover:text-[#2E8FAD] transition-colors">
                {campaign.name}
              </h3>
              <p className="text-[11px] text-[#8BAFC0] mt-1 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                {typeLabel[type]}
                {type === "ai" && (
                  <Badge
                    variant="neutral"
                    className="text-[9px] px-1 py-0 h-4 bg-[#7C3AED]/10 text-[#7C3AED] border-none"
                  >
                    AI
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <Badge
            variant={statusVariant(campaign.status)}
            dot
            className="shadow-sm border-none bg-[#F7F8F9]"
          >
            {statusLabel(campaign.status)}
          </Badge>
        </div>

        {/* Description */}
        {campaign.description && (
          <p className="text-[12px] text-[#4A7A94] leading-[1.55] mb-4 line-clamp-2">
            {campaign.description}
          </p>
        )}

        {/* Progression */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[11px] text-[#8BAFC0]">Progression</span>
            <span className="text-[12px] font-bold text-[#0D2137] tabular-nums">
              {progression}%
            </span>
          </div>
          <div className="h-[6px] w-full rounded-full bg-[#F0F2F4] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progression}%`, background: stripeGradient[type] }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 bg-[#FAFBFC] rounded-[12px] border border-[#E5E7EB] overflow-hidden mb-4 shadow-inner">
          {[
            { label: "Envoyés", value: sent.toLocaleString("fr-FR") },
            { label: "Livrés", value: delivered.toLocaleString("fr-FR") },
            { label: "Taux", value: `${deliveryRate}%` },
          ].map((s, i) => (
            <div
              key={i}
              className={cn(
                "px-2 py-3 text-center transition-colors hover:bg-white",
                i > 0 && "border-l border-[#E5E7EB]",
              )}
            >
              <p className="text-[13px] font-bold text-[#0D2137] leading-none mb-1 tabular-nums">
                {s.value}
              </p>
              <p className="text-[9px] text-[#8BAFC0] uppercase tracking-[0.06em] font-semibold">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Channels */}
        <ChannelTags channels={channels} className="mb-4" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]/60 mt-auto">
          <span className="text-[11px] text-[#8BAFC0] font-medium">
            {campaign.status === "draft" ? "Créée " : "Lancée "}
            {formatRelative(campaign.scheduledAt ?? campaign.createdAt)}
          </span>
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {isDraft && onEdit && (
              <button
                onClick={() => onEdit(campaign.id)}
                className="h-8 px-3 text-[11px] font-bold bg-[#E8F4F8] text-[#2E8FAD] rounded-[8px] hover:bg-[#2E8FAD] hover:text-white transition-all mr-1 uppercase tracking-wider shadow-sm active:scale-95"
              >
                Editer
              </button>
            )}
            <button
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all border border-transparent hover:border-[#2E8FAD]/20 active:scale-95"
              title="Stats"
            >
              <BarChart2 size={14} />
            </button>
            <button
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all border border-transparent hover:border-[#2E8FAD]/20 active:scale-95"
              title="Dupliquer"
              onClick={() => onDuplicate?.(campaign)}
            >
              <Copy size={14} />
            </button>
            <button className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8BAFC0] hover:bg-[#F3F4F6] hover:text-[#0D2137] transition-all border border-transparent active:scale-95">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
