import { useQuery } from "@tanstack/react-query"
import { getApiCurrencyDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCurrencyDetail = (id: string) => {
    const query = useQuery({
        ...getApiCurrencyDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        currency: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
