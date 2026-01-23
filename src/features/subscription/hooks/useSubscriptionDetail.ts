import { useQuery } from "@tanstack/react-query"
import { getApiSubscriptionDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useSubscriptionDetail = (id: string) => {
    const query = useQuery({
        ...getApiSubscriptionDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        subscription: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
