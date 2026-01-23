import { useQuery } from "@tanstack/react-query"
import { getApiMessageEventDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useMessageEventDetail = (id: string) => {
    const query = useQuery({
        ...getApiMessageEventDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        messageEvent: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
