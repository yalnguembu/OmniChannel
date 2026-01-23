import { useQuery } from "@tanstack/react-query"
import {
    getApiBlocklistGetAllStatusOptions,
    getApiBlocklistGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useBlocklistOptions = () => {
    const getAllBlocklistStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiBlocklistGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllBlocklistTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiBlocklistGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllBlocklistStatusQuery,
        getAllBlocklistTypesQuery,
    }
}
