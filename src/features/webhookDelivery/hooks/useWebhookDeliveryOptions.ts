import { useQuery } from "@tanstack/react-query"
import {
    getApiWebhookDeliveryGetAllStatusOptions,
    getApiWebhookDeliveryGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useWebhookDeliveryOptions = () => {
    const getAllWebhookDeliveryStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWebhookDeliveryGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllWebhookDeliveryTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWebhookDeliveryGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllWebhookDeliveryStatusQuery,
        getAllWebhookDeliveryTypesQuery,
    }
}
