import { useQuery } from "@tanstack/react-query"
import { getApiUserDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useUserDetail = (id: string) => {
    const query = useQuery({
        ...getApiUserDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        user: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
