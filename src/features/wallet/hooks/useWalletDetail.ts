import { useQuery } from "@tanstack/react-query"
import { getApiWalletDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useWalletDetail = (id: string) => {
    const query = useQuery({
        ...getApiWalletDetailByIdOptions({ path: { id } }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    })

    return {
        wallet: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
