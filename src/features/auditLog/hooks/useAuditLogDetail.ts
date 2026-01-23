import { useQuery } from "@tanstack/react-query"
import { getApiAuditLogDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useAuditLogDetail = (id: string) => {
    const query = useQuery({
        ...getApiAuditLogDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        auditLog: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
