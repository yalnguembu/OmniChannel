import { useQuery } from "@tanstack/react-query"
import {
    getApiClientChannelPreferenceGetAllStatusOptions,
    getApiClientChannelPreferenceGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useClientChannelPreferenceOptions = () => {
    const getAllClientChannelPreferenceStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientChannelPreferenceGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllClientChannelPreferenceTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiClientChannelPreferenceGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllClientChannelPreferenceStatusQuery,
        getAllClientChannelPreferenceTypesQuery,
    }
}
