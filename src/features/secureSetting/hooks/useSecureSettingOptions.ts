import { useQuery } from "@tanstack/react-query"
import {
    getApiSecureSettingGetAllStatusOptions,
    getApiSecureSettingGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useSecureSettingOptions = () => {
    const getAllSecureSettingStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSecureSettingGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllSecureSettingTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiSecureSettingGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllSecureSettingStatusQuery,
        getAllSecureSettingTypesQuery,
    }
}
