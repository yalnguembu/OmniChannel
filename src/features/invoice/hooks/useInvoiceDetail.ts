import { useQuery } from "@tanstack/react-query"
import { getApiInvoiceDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useInvoiceDetail = (id: string) => {
    const query = useQuery({
        ...getApiInvoiceDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        invoice: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
