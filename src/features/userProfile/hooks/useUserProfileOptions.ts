import { useQuery } from "@tanstack/react-query"
import {
    getApiUserProfileGetAllStatusOptions,
    getApiUserProfileGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useUserProfileOptions = () => {
    const getAllUserProfileStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiUserProfileGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllUserProfileTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiUserProfileGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllUserProfileStatusQuery,
        getAllUserProfileTypesQuery,
    }
}
