import { useQuery } from "@tanstack/react-query"
import {
    getApiTagGetAllStatusOptions,
    getApiTagGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useTagOptions = () => {
    const getAllTagStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiTagGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllTagTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiTagGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllTagStatusQuery,
        getAllTagTypesQuery,
    }
}
