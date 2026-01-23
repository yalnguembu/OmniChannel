import { useQuery } from "@tanstack/react-query"
import {
    getApiWalletGetAllStatusOptions,
    getApiWalletGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useWalletOptions = () => {
    const getAllWalletStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWalletGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllWalletTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiWalletGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllWalletStatusQuery,
        getAllWalletTypesQuery,
    }
}
