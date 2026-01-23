import { useQuery } from "@tanstack/react-query"
import {
    getApiProductChannelGetAllStatusOptions,
    getApiProductChannelGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useProductChannelOptions = () => {
    const getAllProductChannelStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProductChannelGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllProductChannelTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProductChannelGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllProductChannelStatusQuery,
        getAllProductChannelTypesQuery,
    }
}
