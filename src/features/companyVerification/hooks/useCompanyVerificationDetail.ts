import { useQuery } from "@tanstack/react-query"
import { getApiCompanyVerificationDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyVerificationDetail = (id: string) => {
    const query = useQuery({
        ...getApiCompanyVerificationDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        companyVerification: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
