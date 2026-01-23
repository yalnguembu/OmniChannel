import { useQuery } from "@tanstack/react-query"
import {
    getApiSysLogGetAllStatusOptions,
    getApiSysLogGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useSysLogOptions = () => {
    const getAllSysLogStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSysLogGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllSysLogTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSysLogGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllSysLogStatusQuery,
        getAllSysLogTypesQuery,
    }
}
