import { useQuery } from "@tanstack/react-query"
import { getApiTagDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useTagDetail = (id: string) => {
    const query = useQuery({
        ...getApiTagDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        tag: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
