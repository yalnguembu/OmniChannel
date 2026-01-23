import { useQuery } from "@tanstack/react-query"
import {
    getApiPaymentGetAllStatusOptions,
    getApiPaymentGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const usePaymentOptions = () => {
    const getAllPaymentStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiPaymentGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllPaymentTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiPaymentGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllPaymentStatusQuery,
        getAllPaymentTypesQuery,
    }
}
