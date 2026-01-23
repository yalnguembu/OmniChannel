import { useQuery } from "@tanstack/react-query"
import { getApiCompanySettingDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCompanySettingDetail = (id: string) => {
    const query = useQuery({
        ...getApiCompanySettingDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        companySetting: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
