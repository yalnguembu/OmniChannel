import { useQuery } from "@tanstack/react-query"
import { getApiWebhookEndpointDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useWebhookEndpointDetail = (id: string) => {
    const query = useQuery({
        ...getApiWebhookEndpointDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        webhookEndpoint: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
