import { useQuery } from "@tanstack/react-query"
import {
    getApiClientImportGetAllStatusOptions,
    getApiClientImportGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useClientImportOptions = () => {
    const getAllClientImportStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientImportGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllClientImportTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientImportGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllClientImportStatusQuery,
        getAllClientImportTypesQuery,
    }
}
