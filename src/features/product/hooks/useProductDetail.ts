import { useQuery } from "@tanstack/react-query"
import { getApiProductDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useProductDetail = (id: string) => {
    const query = useQuery({
        ...getApiProductDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        product: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
