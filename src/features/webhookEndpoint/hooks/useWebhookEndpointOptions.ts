import { useQuery } from "@tanstack/react-query"
import {
    getApiWebhookEndpointGetAllStatusOptions,
    getApiWebhookEndpointGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useWebhookEndpointOptions = () => {
    const getAllWebhookEndpointStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWebhookEndpointGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllWebhookEndpointTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWebhookEndpointGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllWebhookEndpointStatusQuery,
        getAllWebhookEndpointTypesQuery,
    }
}
