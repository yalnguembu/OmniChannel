import { useQuery } from "@tanstack/react-query"
import {
    getApiCampaignStepGetAllStatusOptions,
    getApiCampaignStepGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCampaignStepOptions = () => {
    const getAllCampaignStepStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignStepGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCampaignStepTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCampaignStepGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCampaignStepStatusQuery,
        getAllCampaignStepTypesQuery,
    }
}
