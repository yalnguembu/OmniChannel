import { useQuery } from "@tanstack/react-query"
import {
    getApiAuditLogGetAllStatusOptions,
    getApiAuditLogGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useAuditLogOptions = () => {
    const getAllAuditLogStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiAuditLogGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllAuditLogTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiAuditLogGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllAuditLogStatusQuery,
        getAllAuditLogTypesQuery,
    }
}
