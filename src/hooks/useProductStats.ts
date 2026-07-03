import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiProductChannelStatisticSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type { SearchProductChannelStatisticResponse } from "@/shared/api/generated/types.gen";

export interface ChannelStat {
  channelId: string;
  name: string;
  code: string;
  sent: number;
  delivered: number;
  failed: number;
  cost: number;
  deliveryRate: number;
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * ViewModel for a product's messaging statistics — aggregates the per-channel /
 * per-period rows into product-wide totals, a real delivery rate and a
 * per-channel breakdown consumed by the overview stats section.
 */
export function useProductStats(productId: string) {
  const { handleRequestError } = useErrorHandling();

  const query = useQuery({
    ...postApiProductChannelStatisticSearchOptions({
      body: {
        productId,
        pageNumber: 1,
        pageSize: 100,
      },
    }),
    select: (res) =>
      (res?.data?.items ?? []) as SearchProductChannelStatisticResponse[],
    enabled: !!productId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const rows = query.data ?? [];

  const agg = useMemo(() => {
    const totalSent = rows.reduce((a, s) => a + (s.messagesSent ?? 0), 0);
    const totalDelivered = rows.reduce(
      (a, s) => a + (s.messagesDelivered ?? 0),
      0,
    );
    const totalFailed = rows.reduce((a, s) => a + (s.messagesFailed ?? 0), 0);
    const totalCost = rows.reduce((a, s) => a + (s.totalCost ?? 0), 0);

    // Group rows (channel × period) into one entry per channel.
    const byChannel = new Map<string, ChannelStat>();
    for (const r of rows) {
      const key = r.channelId ?? r.channelCode ?? r.channelName ?? "—";
      const prev =
        byChannel.get(key) ??
        ({
          channelId: key,
          name: r.channelName || r.channelCode || "Canal",
          code: r.channelCode || "",
          sent: 0,
          delivered: 0,
          failed: 0,
          cost: 0,
          deliveryRate: 0,
        } as ChannelStat);
      prev.sent += r.messagesSent ?? 0;
      prev.delivered += r.messagesDelivered ?? 0;
      prev.failed += r.messagesFailed ?? 0;
      prev.cost += r.totalCost ?? 0;
      byChannel.set(key, prev);
    }
    const perChannel = Array.from(byChannel.values())
      .map((c) => ({
        ...c,
        deliveryRate: c.sent > 0 ? round((c.delivered / c.sent) * 100) : 0,
      }))
      .sort((a, b) => b.sent - a.sent);

    const starts = rows.map((r) => r.periodStart).filter(Boolean).sort();
    const ends = rows.map((r) => r.periodEnd).filter(Boolean).sort();
    const periodStart = starts[0];
    const periodEnd = ends[ends.length - 1];

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      totalCost,
      deliveryRate: totalSent > 0 ? round((totalDelivered / totalSent) * 100) : 0,
      failureRate: totalSent > 0 ? round((totalFailed / totalSent) * 100) : 0,
      perChannel,
      periodStart,
      periodEnd,
      hasData: totalSent > 0 || totalDelivered > 0 || rows.length > 0,
    };
  }, [rows]);

  return {
    stats: rows,
    isLoading: query.isLoading,
    refetch: query.refetch,
    ...agg,
  };
}
