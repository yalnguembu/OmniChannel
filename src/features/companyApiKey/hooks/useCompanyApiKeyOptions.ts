import { useQuery } from "@tanstack/react-query"
import {
    getApiCompanyApiKeyGetAllStatusOptions,
    getApiCompanyApiKeyGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyApiKeyOptions = () => {
    const getAllCompanyApiKeyStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyApiKeyGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCompanyApiKeyTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyApiKeyGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCompanyApiKeyStatusQuery,
        getAllCompanyApiKeyTypesQuery,
    }
}
