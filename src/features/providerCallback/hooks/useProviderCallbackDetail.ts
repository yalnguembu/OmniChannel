import { useQuery } from "@tanstack/react-query"
import { getApiProviderCallbackDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useProviderCallbackDetail = (id: string) => {
    const query = useQuery({
        ...getApiProviderCallbackDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        providerCallback: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
