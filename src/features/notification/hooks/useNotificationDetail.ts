import { useQuery } from "@tanstack/react-query"
import { getApiNotificationDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useNotificationDetail = (id: string) => {
    const query = useQuery({
        ...getApiNotificationDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        notification: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
