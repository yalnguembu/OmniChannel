import { useQuery } from "@tanstack/react-query"
import { getApiFileDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useFileDetail = (id: string) => {
    const query = useQuery({
        ...getApiFileDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        file: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
