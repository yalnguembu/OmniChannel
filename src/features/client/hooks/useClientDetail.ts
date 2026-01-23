import { useQuery } from "@tanstack/react-query"
import { getApiClientDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useClientDetail = (id: string) => {
    const query = useQuery({
        ...getApiClientDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        client: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
