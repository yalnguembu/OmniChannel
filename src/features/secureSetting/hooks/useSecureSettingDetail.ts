import { useQuery } from "@tanstack/react-query"
import { getApiSecureSettingDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useSecureSettingDetail = (id: string) => {
    const query = useQuery({
        ...getApiSecureSettingDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        secureSetting: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
