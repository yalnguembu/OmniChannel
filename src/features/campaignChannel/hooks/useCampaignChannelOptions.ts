import { useQuery } from "@tanstack/react-query"
import {
    getApiCampaignChannelGetAllStatusOptions,
    getApiCampaignChannelGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignChannelOptions = () => {
    const getAllCampaignChannelStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignChannelGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCampaignChannelTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignChannelGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCampaignChannelStatusQuery,
        getAllCampaignChannelTypesQuery,
    }
}
