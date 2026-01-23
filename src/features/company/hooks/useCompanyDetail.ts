import { useQuery } from "@tanstack/react-query"
import { getApiCompanyDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyDetail = (id: string) => {
    const query = useQuery({
        ...getApiCompanyDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        company: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
