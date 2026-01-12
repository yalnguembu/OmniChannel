import { useQuery } from "@tanstack/react-query"
import {
    getApiCompanyGetAllStatusOptions,
    getApiCompanyGetAllTypeOptions,
    getApiCountryDropdownOptions,
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

    const getCountryOptionsQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCountryDropdownOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCompanyStatusQuery,
        getAllCompanyTypesQuery,
        getCountryOptionsQuery,
    }
}
