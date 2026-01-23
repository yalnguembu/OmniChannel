import { useQuery } from "@tanstack/react-query"
import { getApiSubscriptionPlanDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useSubscriptionPlanDetail = (id: string) => {
    const query = useQuery({
        ...getApiSubscriptionPlanDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        subscriptionPlan: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
