import { useQuery } from "@tanstack/react-query"
import { getApiWebhookDeliveryDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useWebhookDeliveryDetail = (id: string) => {
    const query = useQuery({
        ...getApiWebhookDeliveryDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        webhookDelivery: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
