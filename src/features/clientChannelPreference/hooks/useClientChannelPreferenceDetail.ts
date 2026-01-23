import { useQuery } from "@tanstack/react-query"
import { getApiClientChannelPreferenceDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useClientChannelPreferenceDetail = (id: string) => {
    const query = useQuery({
        ...getApiClientChannelPreferenceDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        clientChannelPreference: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
