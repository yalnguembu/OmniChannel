import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
    getApiApplicationDetailByIdOptions,
    getApiApplicationGetApiKeyByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"
import { useEffect } from "react"

export const useApplicationDetail = (id: string) => {
    const { t } = useTranslation()

    const detailQuery = useQuery({
        ...getApiApplicationDetailByIdOptions({ path: { id } }),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })

    const apiKeyQuery = useQuery({
        ...getApiApplicationGetApiKeyByIdOptions({ path: { id } }),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })

    // Monitor errors
    useEffect(() => {
        if (detailQuery.isError) {
            toast.error(t("applications.messages.fetch.error"))
        }
    }, [detailQuery.isError, detailQuery.error, t])

    return {
        application: detailQuery.data?.data,
        apiKey: apiKeyQuery.data?.data,
        isLoading: detailQuery.isLoading || apiKeyQuery.isLoading,
        isError: detailQuery.isError || apiKeyQuery.isError,
        error: detailQuery.error || apiKeyQuery.error,
        refetch: () => {
            detailQuery.refetch()
            apiKeyQuery.refetch()
        },
    }
}
