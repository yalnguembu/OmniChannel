import { useQuery } from "@tanstack/react-query";
import { postApiCampaignStatisticSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";

/**
 * Hook for managing campaign's aggregated statistics and delivery performance.
 */
export function useCampaignStats(campaignId: string) {
  const statsQuery = useQuery({
    ...postApiCampaignStatisticSearchOptions({
      body: {
        campaignId,
        pageNumber: 1,
        pageSize: 1,
      },
    }),
    select: (res) => res?.data?.items?.[0] || null,
    enabled: !!campaignId,
    // Polling if the campaign is active or broadcasting
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === "active" || status === "broadcasting" ? 5000 : false;
    },
  });

  const stats = statsQuery.data;

  return {
    stats,
    isLoading: statsQuery.isLoading,
    refetch: statsQuery.refetch,
    deliveryRate: stats?.deliveryRate || 0,
    openRate: stats?.openRate || 0,
    clickRate: stats?.clickRate || 0,
    totalSent: stats?.totalSent || 0,
    totalDelivered: stats?.totalDelivered || 0,
    totalFailed: stats?.totalFailed || 0,
    totalCost: stats?.totalCost || 0,
  };
}
