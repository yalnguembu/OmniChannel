import { useQuery } from "@tanstack/react-query"
import { getApiCampaignChannelDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignChannelDetail = (id: string) => {
    const query = useQuery({
        ...getApiCampaignChannelDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        campaignChannel: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
