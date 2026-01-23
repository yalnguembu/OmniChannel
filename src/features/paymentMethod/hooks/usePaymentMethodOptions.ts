import { useQuery } from "@tanstack/react-query"
import {
    getApiPaymentMethodGetAllStatusOptions,
    getApiPaymentMethodGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const usePaymentMethodOptions = () => {
    const getAllPaymentMethodStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiPaymentMethodGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllPaymentMethodTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiPaymentMethodGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllPaymentMethodStatusQuery,
        getAllPaymentMethodTypesQuery,
    }
}
