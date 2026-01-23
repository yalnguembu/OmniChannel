import { useQuery } from "@tanstack/react-query"
import { getApiPaymentDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const usePaymentDetail = (id: string) => {
    const query = useQuery({
        ...getApiPaymentDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        payment: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
