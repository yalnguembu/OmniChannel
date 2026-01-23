import { useQuery } from "@tanstack/react-query"
import {
    getApiProviderGetAllStatusOptions,
    getApiProviderGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useProviderOptions = () => {
    const getAllProviderStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProviderGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllProviderTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProviderGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllProviderStatusQuery,
        getAllProviderTypesQuery,
    }
}
