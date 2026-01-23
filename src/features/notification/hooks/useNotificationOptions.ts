import { useQuery } from "@tanstack/react-query"
import {
    getApiNotificationGetAllStatusOptions,
    getApiNotificationGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useNotificationOptions = () => {
    const getAllNotificationStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiNotificationGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllNotificationTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiNotificationGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllNotificationStatusQuery,
        getAllNotificationTypesQuery,
    }
}
