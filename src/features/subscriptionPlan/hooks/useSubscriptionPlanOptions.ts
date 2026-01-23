import { useQuery } from "@tanstack/react-query"
import {
    getApiSubscriptionPlanGetAllStatusOptions,
    getApiSubscriptionPlanGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useSubscriptionPlanOptions = () => {
    const getAllSubscriptionPlanStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSubscriptionPlanGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllSubscriptionPlanTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSubscriptionPlanGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllSubscriptionPlanStatusQuery,
        getAllSubscriptionPlanTypesQuery,
    }
}
