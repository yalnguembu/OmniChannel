import { useQuery } from "@tanstack/react-query"
import {
    getApiCampaignStatisticGetAllStatusOptions,
    getApiCampaignStatisticGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignStatisticOptions = () => {
    const getAllCampaignStatisticStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignStatisticGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCampaignStatisticTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignStatisticGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCampaignStatisticStatusQuery,
        getAllCampaignStatisticTypesQuery,
    }
}
