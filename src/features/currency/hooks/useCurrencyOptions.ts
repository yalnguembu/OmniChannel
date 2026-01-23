import { useQuery } from "@tanstack/react-query"
import {
    getApiCurrencyGetAllStatusOptions,
    getApiCurrencyGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCurrencyOptions = () => {
    const getAllCurrencyStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCurrencyGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCurrencyTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCurrencyGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCurrencyStatusQuery,
        getAllCurrencyTypesQuery,
    }
}
