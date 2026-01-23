import { useQuery } from "@tanstack/react-query"
import { getApiUserProfileDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useUserProfileDetail = (id: string) => {
    const query = useQuery({
        ...getApiUserProfileDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        userProfile: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
