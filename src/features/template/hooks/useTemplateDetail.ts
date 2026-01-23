import { useQuery } from "@tanstack/react-query"
import { getApiTemplateDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useTemplateDetail = (id: string) => {
    const query = useQuery({
        ...getApiTemplateDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        template: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
