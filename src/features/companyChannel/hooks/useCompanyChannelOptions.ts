import { useQuery } from "@tanstack/react-query"
import {
    getApiCompanyChannelGetAllStatusOptions,
    getApiCompanyChannelGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCompanyChannelOptions = () => {
    const getAllCompanyChannelStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyChannelGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCompanyChannelTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyChannelGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCompanyChannelStatusQuery,
        getAllCompanyChannelTypesQuery,
    }
}
