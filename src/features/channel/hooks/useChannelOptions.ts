import { useQuery } from "@tanstack/react-query"
import {
    getApiChannelGetAllStatusOptions,
    getApiChannelGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useChannelOptions = () => {
    const getAllChannelStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiChannelGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllChannelTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiChannelGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllChannelStatusQuery,
        getAllChannelTypesQuery,
    }
}
