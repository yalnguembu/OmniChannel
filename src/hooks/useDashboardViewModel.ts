import { useQuery } from "@tanstack/react-query";
import {
  postApiProductSearchOptions,
  postApiCampaignSearchOptions,
  postApiMessageSearchOptions,
  postApiClientSearchOptions,
  postApiWalletSearchOptions,
  postApiNotificationSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { mapToCampaignModels } from "@/models/campaign.model";
import { mapToProductModels } from "@/models/product.model";

/**
 * ViewModel for the global (portal) Dashboard page.
 *
 * There is no dedicated dashboard/stats endpoint on the API, so totals are read
 * from the `totalCount` of the `…/search` responses (a `pageSize: 1` probe is
 * enough) and recent lists from small pages. No time-series is available, so the
 * KPIs surface honest captions rather than fabricated up/down trends.
 */
export function useDashboardViewModel() {
  // 1. Products (recent list)
  const productsQuery = useQuery({
    ...postApiProductSearchOptions({ body: { pageNumber: 1, pageSize: 6 } }),
    select: (res: any) => mapToProductModels(res?.data?.items || []),
  });

  // 2. Campaigns (recent list + real total via totalCount)
  const campaignsQuery = useQuery({
    ...postApiCampaignSearchOptions({ body: { pageNumber: 1, pageSize: 5 } }),
    select: (res: any) => ({
      items: mapToCampaignModels(res?.data?.items || []),
      totalCount: (res?.data?.totalCount as number) || 0,
    }),
  });

  // 2b. Active campaigns — real count via a filtered probe, not a count over the
  // 5-row recent page (which under-counts as soon as there are >5 campaigns).
  const activeCampaignsQuery = useQuery({
    ...postApiCampaignSearchOptions({
      body: { pageNumber: 1, pageSize: 1, status: "active" },
    }),
    select: (res: any) => (res?.data?.totalCount as number) || 0,
  });

  // 3. Stats (total counts via pageSize:1 + totalCount)
  const messagesQuery = useQuery({
    ...postApiMessageSearchOptions({ body: { pageNumber: 1, pageSize: 1 } }),
  }) as any;

  const contactsQuery = useQuery({
    ...postApiClientSearchOptions({ body: { pageNumber: 1, pageSize: 1 } }),
  }) as any;

  // 4. Wallet
  const walletQuery = useQuery({
    ...postApiWalletSearchOptions({ body: { pageNumber: 1, pageSize: 1 } }),
    refetchInterval: 60000, // Refresh balance every minute
  }) as any;

  // 5. Notifications
  const notificationsQuery = useQuery({
    ...postApiNotificationSearchOptions({
      body: { pageNumber: 1, pageSize: 10 },
    }),
    refetchInterval: 30000, // Poll for new notifications
  }) as any;

  // 6. Recent Messages
  const recentMessagesQuery = useQuery({
    ...postApiMessageSearchOptions({ body: { pageNumber: 1, pageSize: 8 } }),
  }) as any;

  // Calculated properties
  const wallet = walletQuery.data?.data?.items?.[0];
  const isWalletLow =
    wallet &&
    wallet.lowBalanceThreshold != null &&
    (wallet.balance ?? 0) < wallet.lowBalanceThreshold;

  const totalMessages = messagesQuery.data?.data?.totalCount || 0;
  const totalContacts = contactsQuery.data?.data?.totalCount || 0;

  return {
    // Data
    products: productsQuery.data || [],
    campaigns: campaignsQuery.data?.items || [],
    wallet,
    notifications: notificationsQuery.data?.data?.items || [],
    recentMessages: recentMessagesQuery.data?.data?.items || [],

    // Status — gate the loader on the queries that feed the above-the-fold KPIs
    // so they don't flash placeholder zeros before resolving.
    isLoading:
      productsQuery.isLoading ||
      campaignsQuery.isLoading ||
      activeCampaignsQuery.isLoading ||
      messagesQuery.isLoading ||
      contactsQuery.isLoading,
    isWalletLow,
    totalMessages,
    totalContacts,
    totalCampaigns: campaignsQuery.data?.totalCount || 0,
    activeCampaignsCount: activeCampaignsQuery.data || 0,

    // Actions
    refetchAll: () => {
      productsQuery.refetch();
      campaignsQuery.refetch();
      activeCampaignsQuery.refetch();
      walletQuery.refetch();
      notificationsQuery.refetch();
    },
  };
}
