import { useQuery } from "@tanstack/react-query"
import { getApiCampaignStatisticDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignStatisticDetail = (id: string) => {
    const query = useQuery({
        ...getApiCampaignStatisticDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        campaignStatistic: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
