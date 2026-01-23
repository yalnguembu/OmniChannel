import { useQuery } from "@tanstack/react-query"
import { getApiClientSegmentMemberDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useClientSegmentMemberDetail = (id: string) => {
    const query = useQuery({
        ...getApiClientSegmentMemberDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        clientSegmentMember: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
