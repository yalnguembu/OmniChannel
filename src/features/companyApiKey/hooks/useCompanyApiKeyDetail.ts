import { useQuery } from "@tanstack/react-query"
import { getApiCompanyApiKeyDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyApiKeyDetail = (id: string) => {
    const query = useQuery({
        ...getApiCompanyApiKeyDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        companyApiKey: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
