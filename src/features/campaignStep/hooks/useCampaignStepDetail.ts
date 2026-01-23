import { useQuery } from "@tanstack/react-query"
import { getApiCampaignStepDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignStepDetail = (id: string) => {
    const query = useQuery({
        ...getApiCampaignStepDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        campaignStep: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
