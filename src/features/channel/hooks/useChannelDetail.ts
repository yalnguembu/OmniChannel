import { useQuery } from "@tanstack/react-query"
import { getApiChannelDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useChannelDetail = (id: string) => {
    const query = useQuery({
        ...getApiChannelDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        channel: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
