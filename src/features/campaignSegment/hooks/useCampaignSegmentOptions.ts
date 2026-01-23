import { useQuery } from "@tanstack/react-query"
import {
    getApiCampaignSegmentGetAllStatusOptions,
    getApiCampaignSegmentGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignSegmentOptions = () => {
    const getAllCampaignSegmentStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignSegmentGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCampaignSegmentTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignSegmentGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCampaignSegmentStatusQuery,
        getAllCampaignSegmentTypesQuery,
    }
}
