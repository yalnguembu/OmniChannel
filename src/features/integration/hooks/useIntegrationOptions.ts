import { useQuery } from "@tanstack/react-query"
import {
    getApiIntegrationGetAllStatusOptions,
    getApiIntegrationGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useIntegrationOptions = () => {
    const getAllIntegrationStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiIntegrationGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllIntegrationTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiIntegrationGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllIntegrationStatusQuery,
        getAllIntegrationTypesQuery,
    }
}
