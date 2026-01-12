import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getApiCompanyDetailByIdOptions } from "@/shared/api/@tanstack/react-query.gen"
import { useEffect } from "react"

export const useCompanyDetail = (id: string) => {
    const { t } = useTranslation()

    const query = useQuery({
        ...getApiCompanyDetailByIdOptions({ path: { id } }),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })

    // Monitor errors
    useEffect(() => {
        if (query.isError) {
            toast.error(t("companies.messages.fetch.error"))
        }
    }, [query.isError, query.error, t])

    return {
        company: query.data?.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch
    }
}
