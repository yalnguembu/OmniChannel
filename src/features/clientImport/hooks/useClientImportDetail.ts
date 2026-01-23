import { useQuery } from "@tanstack/react-query"
import { getApiClientImportDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useClientImportDetail = (id: string) => {
    const query = useQuery({
        ...getApiClientImportDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        clientImport: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
