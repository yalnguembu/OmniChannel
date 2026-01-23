import { useQuery } from "@tanstack/react-query"
import {
    getApiCompanyVerificationGetAllStatusOptions,
    getApiCompanyVerificationGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyVerificationOptions = () => {
    const getAllCompanyVerificationStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyVerificationGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCompanyVerificationTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyVerificationGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCompanyVerificationStatusQuery,
        getAllCompanyVerificationTypesQuery,
    }
}
