import { useQuery } from "@tanstack/react-query"
import { getApiPricingDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const usePricingDetail = (id: string) => {
    const query = useQuery({
        ...getApiPricingDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        pricing: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
