import { useQuery } from "@tanstack/react-query"
import {
    getApiProviderCallbackGetAllStatusOptions,
    getApiProviderCallbackGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useProviderCallbackOptions = () => {
    const getAllProviderCallbackStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProviderCallbackGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllProviderCallbackTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProviderCallbackGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllProviderCallbackStatusQuery,
        getAllProviderCallbackTypesQuery,
    }
}
