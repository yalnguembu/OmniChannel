import { useQuery } from "@tanstack/react-query"
import {
    getApiSubscriptionGetAllStatusOptions,
    getApiSubscriptionGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useSubscriptionOptions = () => {
    const getAllSubscriptionStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSubscriptionGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllSubscriptionTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSubscriptionGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllSubscriptionStatusQuery,
        getAllSubscriptionTypesQuery,
    }
}
