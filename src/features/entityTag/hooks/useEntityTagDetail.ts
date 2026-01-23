import { useQuery } from "@tanstack/react-query"
import { getApiEntityTagDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useEntityTagDetail = (id: string) => {
    const query = useQuery({
        ...getApiEntityTagDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        entityTag: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
