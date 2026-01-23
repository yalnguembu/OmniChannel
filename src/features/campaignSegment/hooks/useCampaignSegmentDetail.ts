import { useQuery } from "@tanstack/react-query"
import { getApiCampaignSegmentDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignSegmentDetail = (id: string) => {
    const query = useQuery({
        ...getApiCampaignSegmentDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        campaignSegment: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
