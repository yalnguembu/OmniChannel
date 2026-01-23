import { useQuery } from "@tanstack/react-query"
import { getApiCountryDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCountryDetail = (id: string) => {
    const query = useQuery({
        ...getApiCountryDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        country: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
