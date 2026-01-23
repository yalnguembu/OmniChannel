import { useQuery } from "@tanstack/react-query"
import { getApiConnectorDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useConnectorDetail = (id: string) => {
    const query = useQuery({
        ...getApiConnectorDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        connector: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
