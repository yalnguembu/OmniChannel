import { useQuery } from "@tanstack/react-query"
import { getApiIntegrationSyncLogDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useIntegrationSyncLogDetail = (id: string) => {
    const query = useQuery({
        ...getApiIntegrationSyncLogDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        integrationSyncLog: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
