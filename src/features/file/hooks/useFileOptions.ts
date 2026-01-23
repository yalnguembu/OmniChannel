import { useQuery } from "@tanstack/react-query"
import {
    getApiFileGetAllStatusOptions,
    getApiFileGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useFileOptions = () => {
    const getAllFileStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiFileGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllFileTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiFileGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllFileStatusQuery,
        getAllFileTypesQuery,
    }
}
