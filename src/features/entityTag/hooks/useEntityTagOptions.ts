import { useQuery } from "@tanstack/react-query"
import {
    getApiEntityTagGetAllStatusOptions,
    getApiEntityTagGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useEntityTagOptions = () => {
    const getAllEntityTagStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiEntityTagGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllEntityTagTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiEntityTagGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllEntityTagStatusQuery,
        getAllEntityTagTypesQuery,
    }
}
