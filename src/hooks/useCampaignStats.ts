import { useQuery } from "@tanstack/react-query";
import { postApiCampaignStatisticSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchCampaignStatisticResponse } from "@/shared/api/generated/types.gen";

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
    select: (res) =>
      (res?.data?.items?.[0] as SearchCampaignStatisticResponse) || null,
    enabled: !!campaignId,
    // Polling if the campaign is active or broadcasting
    refetchInterval: (query) => {
      const status = (query.state.data as SearchCampaignStatisticResponse | null)
        ?.campaignStatus;
      return status === "active" || status === "broadcasting" ? 5000 : false;
    },
  });

  const stats = statsQuery.data;

  return {
    stats,
    isLoading: statsQuery.isLoading,
    refetch: statsQuery.refetch,
    // Rates (real, from SearchCampaignStatisticResponse)
    deliveryRate: stats?.deliveryRate || 0,
    openRate: stats?.openRate || 0,
    clickRate: stats?.clickRate || 0,
    bounceRate: stats?.bounceRate || 0,
    // Volumes (real funnel inputs)
    totalRecipients: stats?.totalRecipients || 0,
    totalSent: stats?.totalSent || 0,
    totalDelivered: stats?.totalDelivered || 0,
    totalOpened: stats?.totalOpened || 0,
    totalClicked: stats?.totalClicked || 0,
    totalFailed: stats?.totalFailed || 0,
    totalBounced: stats?.totalBounced || 0,
    totalCost: stats?.totalCost || 0,
    // True when the campaign has at least one dispatched message
    hasActivity: (stats?.totalSent || 0) > 0 || (stats?.totalRecipients || 0) > 0,
  };
}
