import { useQuery } from "@tanstack/react-query"
import {
    getApiPricingGetAllStatusOptions,
    getApiPricingGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const usePricingOptions = () => {
    const getAllPricingStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiPricingGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllPricingTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiPricingGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllPricingStatusQuery,
        getAllPricingTypesQuery,
    }
}
