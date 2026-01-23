import { useQuery } from "@tanstack/react-query"
import {
    getApiMessageGetAllStatusOptions,
    getApiMessageGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useMessageOptions = () => {
    const getAllMessageStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiMessageGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllMessageTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiMessageGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllMessageStatusQuery,
        getAllMessageTypesQuery,
    }
}
