import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart2, MoreVertical } from "lucide-react";
import { statusLabel, fmt, cn } from "@/lib/utils";
import { formatRelative } from "@/lib/date";
import { cardItem } from "@/lib/animations";
import { ChannelTags, type ChannelLike } from "@/components/ui/ChannelTags";
import { useProductStats } from "@/hooks/useProductStats";
import { ChannelService } from "@/shared/api/services";
import {
  postApiClientSearchOptions,
  postApiCampaignSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { ProductModel } from "@/models/product.model";

/* ─── Status helpers ──────────────────────────────────────────────── */

const statusStyle: Record<
  string,
  { badge: string; dot: string; bar: string; iconBg: string; iconColor: string }
> = {
  active: {
    badge: "bg-[#DCFCE7] text-[#16A34A]",
    dot: "#16A34A",
    bar: "#2E8FAD",
    iconBg: "#E8F4F8",
    iconColor: "#2E8FAD",
  },
  paused: {
    badge: "bg-[#FEF3C7] text-[#D97706]",
    dot: "#D97706",
    bar: "#D97706",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
  },
  draft: {
    badge: "bg-[#F0F2F4] text-[#4A7A94]",
    dot: "#8BAFC0",
    bar: "#DDE4EA",
    iconBg: "#F4F5F6",
    iconColor: "#8BAFC0",
  },
  inactive: {
    badge: "bg-[#F0F2F4] text-[#4A7A94]",
    dot: "#8BAFC0",
    bar: "#DDE4EA",
    iconBg: "#F4F5F6",
    iconColor: "#8BAFC0",
  },
};

function getStatusStyle(status: string) {
  return statusStyle[status] ?? statusStyle.draft;
}

/* ─── Component ───────────────────────────────────────────────────── */

interface ProductCardProps {
  product: ProductModel;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const navigate = useNavigate();
  const st = getStatusStyle(product.status);

  // Real delivery stats for this product (aggregated across channels).
  const stats = useProductStats(product.id);

  // Lightweight counts (pageSize 1 → only totalCount matters). These run once
  // per visible card; the grid is paginated so the count stays bounded.
  const { data: contactsCount } = useQuery({
    ...postApiClientSearchOptions({
      body: { productId: product.id, pageNumber: 1, pageSize: 1 } as any,
    }),
    select: (res: any) => res?.data?.totalCount ?? 0,
    enabled: !!product.id,
    staleTime: 2 * 60 * 1000,
  });

  const { data: campaignsCount } = useQuery({
    ...postApiCampaignSearchOptions({
      body: { productId: product.id, pageNumber: 1, pageSize: 1 } as any,
    }),
    select: (res: any) => res?.data?.totalCount ?? 0,
    enabled: !!product.id,
    staleTime: 2 * 60 * 1000,
  });

  // Channels dropdown — shared queryKey, so React Query dedupes it to a
  // single request across every card on the (paginated) grid.
  const { data: channelsData } = useQuery({
    queryKey: ["channels", "dropdown"],
    queryFn: () => ChannelService.getDropdown() as any,
    staleTime: 5 * 60 * 1000,
  });
  const allChannels: any[] = channelsData?.data ?? [];

  // Cross-reference the channelIds present in the stats with the dropdown to
  // resolve each channel's type for the tag chips.
  const channels = React.useMemo<ChannelLike[]>(() => {
    const ids = new Set(stats.stats.map((s: any) => s.channelId));
    return Array.from(ids).map((id) => {
      const ch = allChannels.find((c) => c.id === id);
      return { type: ch?.type ?? ch?.code, name: ch?.name };
    });
  }, [stats.stats, allChannels]);

  return (
    <motion.div
      variants={cardItem}
      layout
      className="bg-white border-[0.5px] border-[#E5E7EB] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-[200ms] hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(13,33,55,0.09)] hover:border-[#6AB8D4] group relative"
      onClick={() =>
        navigate({
          to: "/products/$productId",
          params: { productId: product.id },
        })
      }
    >
      {/* ── Top color bar (5 px) ── */}
      <div className="h-[5px] w-full" style={{ background: st.bar }} />

      {/* ── Card body ── */}
      <div className="px-[18px] pt-[18px] pb-[14px]">
        {/* Head: icon + title/id + status */}
        <div className="flex items-start justify-between mb-[14px]">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border-[0.5px] border-[#E5E7EB]"
              style={{ background: st.iconBg }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 2L3 5.5v7L9 16l6-3.5v-7L9 2z"
                  stroke={st.iconColor}
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="9" r="2" fill={st.iconColor} opacity=".5" />
              </svg>
            </div>

            {/* Title + ID */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#0D2137] tracking-[-0.01em] leading-[1.3] mb-[3px] truncate">
                {product.name || "Produit sans nom"}
              </p>
              <p className="text-[10.5px] text-[#8BAFC0]">
                {product.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-[3px] rounded-[5px] text-[10.5px] font-medium flex-shrink-0 ml-2",
              st.badge,
            )}
          >
            <span
              className="w-[4.5px] h-[4.5px] rounded-full flex-shrink-0"
              style={{ background: "currentColor" }}
            />
            {statusLabel(product.status)}
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-[#4A7A94] leading-[1.55] mb-[14px] line-clamp-2">
          {product.description || "Aucune description fournie pour ce produit."}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 bg-[#F0F2F4] rounded-[8px] overflow-hidden mb-[14px]">
          {[
            {
              label: "Messages",
              value: stats.isLoading ? "—" : fmt(stats.totalSent),
            },
            {
              label: "Contacts",
              value: contactsCount == null ? "—" : fmt(contactsCount),
            },
            {
              label: "Campagnes",
              value: campaignsCount == null ? "—" : fmt(campaignsCount),
            },
          ].map((s, i) => (
            <div
              key={i}
              className={cn(
                "py-[10px] text-center",
                i > 0 && "border-l-[0.5px] border-[#E5E7EB]",
              )}
            >
              <p className="text-[14px] font-medium text-[#0D2137] tracking-[-0.015em] leading-none tabular-nums">
                {s.value}
              </p>
              <p className="text-[10px] text-[#8BAFC0] mt-[3px] uppercase tracking-[0.04em]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Channels */}
        <ChannelTags channels={channels} className="mb-[14px]" />

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3 border-t-[0.5px] border-[#E5E7EB]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] text-[#8BAFC0]">
            {formatRelative(product.updatedAt ?? product.createdAt)}
          </span>

          <div className="flex gap-[6px]">
            {/* Stats */}
            <button
              title="Statistiques"
              className="w-[26px] h-[26px] rounded-[6px] border-[0.5px] border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:border-[#6AB8D4] hover:text-[#2E8FAD] transition-all"
            >
              <BarChart2 size={13} />
            </button>

            {/* Edit */}
            <button
              onClick={onEdit}
              title="Modifier"
              className="w-[26px] h-[26px] rounded-[6px] border-[0.5px] border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:border-[#6AB8D4] hover:text-[#2E8FAD] transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M9 2.5L10.5 4 4.5 10H3v-1.5L9 2.5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* More */}
            <button
              title="Plus d'actions"
              className="w-[26px] h-[26px] rounded-[6px] border-[0.5px] border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:border-[#6AB8D4] hover:text-[#2E8FAD] transition-all"
            >
              <MoreVertical size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
