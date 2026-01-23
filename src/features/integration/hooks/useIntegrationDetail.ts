import { useQuery } from "@tanstack/react-query"
import { getApiIntegrationDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useIntegrationDetail = (id: string) => {
    const query = useQuery({
        ...getApiIntegrationDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        integration: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
