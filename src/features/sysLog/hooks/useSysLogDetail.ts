import { useQuery } from "@tanstack/react-query"
import { getApiSysLogDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useSysLogDetail = (id: string) => {
    const query = useQuery({
        ...getApiSysLogDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        sysLog: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
