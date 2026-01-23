import { useQuery } from "@tanstack/react-query"
import { getApiCampaignDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignDetail = (id: string) => {
    const query = useQuery({
        ...getApiCampaignDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        campaign: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
