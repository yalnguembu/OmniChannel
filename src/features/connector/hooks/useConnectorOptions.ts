import { useQuery } from "@tanstack/react-query"
import {
    getApiConnectorGetAllStatusOptions,
    getApiConnectorGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useConnectorOptions = () => {
    const getAllConnectorStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiConnectorGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllConnectorTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiConnectorGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllConnectorStatusQuery,
        getAllConnectorTypesQuery,
    }
}
