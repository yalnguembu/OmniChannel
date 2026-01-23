import { useQuery } from "@tanstack/react-query"
import { getApiProductChannelDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useProductChannelDetail = (id: string) => {
    const query = useQuery({
        ...getApiProductChannelDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        productChannel: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
