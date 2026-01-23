import { useQuery } from "@tanstack/react-query"
import {
    getApiClientSegmentGetAllStatusOptions,
    getApiClientSegmentGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useClientSegmentOptions = () => {
    const getAllClientSegmentStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientSegmentGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllClientSegmentTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientSegmentGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllClientSegmentStatusQuery,
        getAllClientSegmentTypesQuery,
    }
}
