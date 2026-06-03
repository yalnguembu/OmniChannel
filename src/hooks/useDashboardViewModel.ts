import { useQuery } from "@tanstack/react-query";
import {
  postApiProductSearchOptions,
  postApiCampaignSearchOptions,
  postApiMessageSearchOptions,
  postApiWalletSearchOptions,
  postApiNotificationSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { mapToCampaignModels } from "@/models/campaign.model";
import { mapToProductModels } from "@/models/product.model";

/**
 * ViewModel for the global Dashboard page.
 * Orchestrates multiple data sources for an overview.
 */
export function useDashboardViewModel() {
  // 1. Products
  const productsQuery = useQuery({
    ...postApiProductSearchOptions({ body: { pageNumber: 1, pageSize: 6 } }),
    select: (res: any) => mapToProductModels(res?.data?.items || []),
  });

  // 2. Campaigns
  const campaignsQuery = useQuery({
    ...postApiCampaignSearchOptions({ body: { pageNumber: 1, pageSize: 5 } }),
    select: (res: any) => mapToCampaignModels(res?.data?.items || []),
  });

  // 3. Stats (Total counts)
  const messagesQuery = useQuery({
    ...postApiMessageSearchOptions({ body: { pageNumber: 1, pageSize: 1 } }),
  }) as any;

  const contactsQuery = useQuery({
    queryKey: ["contacts-count"],
    queryFn: () => {}, // TODO: postApiClientSearchOptions when uncommented
  });

  // 4. Wallet
  const walletQuery = useQuery({
    ...postApiWalletSearchOptions({ body: { pageNumber: 1, pageSize: 1 } }),
    refetchInterval: 60000, // Refresh balance every minute
  }) as any;

  // 5. Notifications
  const notificationsQuery = useQuery({
    ...postApiNotificationSearchOptions({
      body: {
        pageNumber: 1,
        pageSize: 10,
      },
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
  const totalContacts = 0; // contactsQuery.data?.data?.totalCount || 0;

  const activeCampaignsCount =
    campaignsQuery.data?.filter((c) => c.status === "active").length || 0;

  return {
    // Data
    products: productsQuery.data || [],
    campaigns: campaignsQuery.data || [],
    wallet,
    notifications: notificationsQuery.data?.data?.items || [],
    recentMessages: recentMessagesQuery.data?.data?.items || [],

    // Status
    isLoading: productsQuery.isLoading || campaignsQuery.isLoading,
    isWalletLow,
    totalMessages,
    totalContacts,
    activeCampaignsCount,

    // Actions
    refetchAll: () => {
      productsQuery.refetch();
      campaignsQuery.refetch();
      walletQuery.refetch();
      notificationsQuery.refetch();
    },
  };
}
