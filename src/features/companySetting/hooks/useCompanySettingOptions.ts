import { useQuery } from "@tanstack/react-query"
import {
    getApiCompanySettingGetAllStatusOptions,
    getApiCompanySettingGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useCompanySettingOptions = () => {
    const getAllCompanySettingStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanySettingGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllCompanySettingTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanySettingGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllCompanySettingStatusQuery,
        getAllCompanySettingTypesQuery,
    }
}
