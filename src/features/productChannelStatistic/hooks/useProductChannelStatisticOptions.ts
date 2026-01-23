import { useQuery } from "@tanstack/react-query"
import {
    getApiProductChannelStatisticGetAllStatusOptions,
    getApiProductChannelStatisticGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useProductChannelStatisticOptions = () => {
    const getAllProductChannelStatisticStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProductChannelStatisticGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllProductChannelStatisticTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProductChannelStatisticGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllProductChannelStatisticStatusQuery,
        getAllProductChannelStatisticTypesQuery,
    }
}
