import { useQuery } from "@tanstack/react-query"
import {
    getApiIntegrationSyncLogGetAllStatusOptions,
    getApiIntegrationSyncLogGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useIntegrationSyncLogOptions = () => {
    const getAllIntegrationSyncLogStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiIntegrationSyncLogGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllIntegrationSyncLogTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiIntegrationSyncLogGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllIntegrationSyncLogStatusQuery,
        getAllIntegrationSyncLogTypesQuery,
    }
}
