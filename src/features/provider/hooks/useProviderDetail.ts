import { useQuery } from "@tanstack/react-query"
import { getApiProviderDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useProviderDetail = (id: string) => {
    const query = useQuery({
        ...getApiProviderDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        provider: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
