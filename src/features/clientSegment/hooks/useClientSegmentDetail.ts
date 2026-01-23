import { useQuery } from "@tanstack/react-query"
import { getApiClientSegmentDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useClientSegmentDetail = (id: string) => {
    const query = useQuery({
        ...getApiClientSegmentDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        clientSegment: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
