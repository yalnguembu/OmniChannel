import { useQuery } from "@tanstack/react-query"
import {
    getApiProductGetAllStatusOptions,
    getApiProductGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useProductOptions = () => {
    const getAllProductStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProductGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllProductTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiProductGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllProductStatusQuery,
        getAllProductTypesQuery,
    }
}
