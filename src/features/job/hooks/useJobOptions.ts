import { useQuery } from "@tanstack/react-query"
import {
    getApiJobGetAllStatusOptions,
    getApiJobGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useJobOptions = () => {
    const getAllJobStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiJobGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllJobTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiJobGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllJobStatusQuery,
        getAllJobTypesQuery,
    }
}
