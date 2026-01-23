import { useQuery } from "@tanstack/react-query"
import {
    getApiCountryGetAllStatusOptions,
    getApiCountryGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCountryOptions = () => {
    const getAllCountryStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCountryGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCountryTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCountryGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCountryStatusQuery,
        getAllCountryTypesQuery,
    }
}
