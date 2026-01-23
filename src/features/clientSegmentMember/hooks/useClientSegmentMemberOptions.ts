import { useQuery } from "@tanstack/react-query"
import {
    getApiClientSegmentMemberGetAllStatusOptions,
    getApiClientSegmentMemberGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useClientSegmentMemberOptions = () => {
    const getAllClientSegmentMemberStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientSegmentMemberGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllClientSegmentMemberTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientSegmentMemberGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllClientSegmentMemberStatusQuery,
        getAllClientSegmentMemberTypesQuery,
    }
}
