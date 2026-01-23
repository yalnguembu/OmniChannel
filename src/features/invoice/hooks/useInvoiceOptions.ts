import { useQuery } from "@tanstack/react-query"
import {
    getApiInvoiceGetAllStatusOptions,
    getApiInvoiceGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useInvoiceOptions = () => {
    const getAllInvoiceStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiInvoiceGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllInvoiceTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiInvoiceGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllInvoiceStatusQuery,
        getAllInvoiceTypesQuery,
    }
}
