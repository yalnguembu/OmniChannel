import { useQuery } from "@tanstack/react-query"
import { getApiMessageDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useMessageDetail = (id: string) => {
    const query = useQuery({
        ...getApiMessageDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        message: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
