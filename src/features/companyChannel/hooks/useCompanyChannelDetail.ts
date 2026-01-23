import { useQuery } from "@tanstack/react-query"
import { getApiCompanyChannelDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyChannelDetail = (id: string) => {
    const query = useQuery({
        ...getApiCompanyChannelDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        companyChannel: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
