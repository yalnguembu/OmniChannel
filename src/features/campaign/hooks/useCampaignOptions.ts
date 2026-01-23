import { useQuery } from "@tanstack/react-query"
import {
    getApiCampaignGetAllStatusOptions,
    getApiCampaignGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignOptions = () => {
    const getAllCampaignStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCampaignTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCampaignStatusQuery,
        getAllCampaignTypesQuery,
    }
}
