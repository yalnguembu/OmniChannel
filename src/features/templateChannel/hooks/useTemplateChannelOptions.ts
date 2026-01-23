import { useQuery } from "@tanstack/react-query"
import {
    getApiTemplateChannelGetAllStatusOptions,
    getApiTemplateChannelGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useTemplateChannelOptions = () => {
    const getAllTemplateChannelStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiTemplateChannelGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllTemplateChannelTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiTemplateChannelGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllTemplateChannelStatusQuery,
        getAllTemplateChannelTypesQuery,
    }
}
