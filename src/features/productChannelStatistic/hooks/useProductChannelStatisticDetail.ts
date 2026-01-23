import { useQuery } from "@tanstack/react-query"
import { getApiProductChannelStatisticDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useProductChannelStatisticDetail = (id: string) => {
    const query = useQuery({
        ...getApiProductChannelStatisticDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        productChannelStatistic: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
