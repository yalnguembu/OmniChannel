import { useQuery } from "@tanstack/react-query"
import {
    getApiMessageEventGetAllStatusOptions,
    getApiMessageEventGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useMessageEventOptions = () => {
    const getAllMessageEventStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiMessageEventGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllMessageEventTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiMessageEventGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllMessageEventStatusQuery,
        getAllMessageEventTypesQuery,
    }
}
