import { useQuery } from "@tanstack/react-query"
import { getApiSettingDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useSettingDetail = (id: string) => {
    const query = useQuery({
        ...getApiSettingDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        setting: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
