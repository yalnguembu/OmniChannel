import { useQuery } from "@tanstack/react-query"
import {
    getApiClientGetAllStatusOptions,
    getApiClientGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useClientOptions = () => {
    const getAllClientStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllClientTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllClientStatusQuery,
        getAllClientTypesQuery,
    }
}
