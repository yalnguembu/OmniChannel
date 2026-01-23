import { useQuery } from "@tanstack/react-query"
import {
    getApiTemplateGetAllStatusOptions,
    getApiTemplateGetAllTypeOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const useTemplateOptions = () => {
    const getAllTemplateStatusQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiTemplateGetAllStatusOptions(),
            staleTime: 10 * 60 * 1000,
        })

    const getAllTemplateTypesQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiTemplateGetAllTypeOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getAllTemplateStatusQuery,
        getAllTemplateTypesQuery,
    }
}
