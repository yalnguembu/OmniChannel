import { useQuery } from "@tanstack/react-query"
import {
    getApiCompanyGetAllStatusOptions,
    getApiCompanyGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyOptions = () => {
    const getAllCompanyStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCompanyTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCompanyStatusQuery,
        getAllCompanyTypesQuery,
    }
}
