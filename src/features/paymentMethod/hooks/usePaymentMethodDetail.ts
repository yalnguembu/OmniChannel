import { useQuery } from "@tanstack/react-query"
import { getApiPaymentMethodDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const usePaymentMethodDetail = (id: string) => {
    const query = useQuery({
        ...getApiPaymentMethodDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        paymentMethod: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
