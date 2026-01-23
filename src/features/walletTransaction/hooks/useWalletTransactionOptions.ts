import { useQuery } from "@tanstack/react-query"
import {
    getApiWalletTransactionGetAllStatusOptions,
    getApiWalletTransactionGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useWalletTransactionOptions = () => {
    const getAllWalletTransactionStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWalletTransactionGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllWalletTransactionTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWalletTransactionGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllWalletTransactionStatusQuery,
        getAllWalletTransactionTypesQuery,
    }
}
