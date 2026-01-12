import { useQuery } from "@tanstack/react-query"
import { getApiCompanyDropdownOptions } from "@/shared/api/@tanstack/react-query.gen"

export const useApplicationOptions = () => {
    const getCompanyOptionsQuery = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            ...getApiCompanyDropdownOptions(),
            staleTime: 10 * 60 * 1000,
        })

    return {
        getCompanyOptionsQuery,
    }
}
