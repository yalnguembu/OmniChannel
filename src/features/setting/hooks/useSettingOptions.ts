import { useQuery } from "@tanstack/react-query"
import {
    getApiSettingGetAllStatusOptions,
    getApiSettingGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useSettingOptions = () => {
    const getAllSettingStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSettingGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllSettingTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSettingGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllSettingStatusQuery,
        getAllSettingTypesQuery,
    }
}
