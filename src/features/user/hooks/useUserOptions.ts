import { useQuery } from "@tanstack/react-query"
import {
    getApiUserGetAllStatusOptions,
    getApiUserGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useUserOptions = () => {
    const getAllUserStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiUserGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllUserTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiUserGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllUserStatusQuery,
        getAllUserTypesQuery,
    }
}
