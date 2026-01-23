import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCampaignStatisticMutation,
    putApiCampaignStatisticMutation,
    deleteApiCampaignStatisticByIdMutation,
    getApiCampaignStatisticByIdQueryKey,
    getApiCampaignStatisticDetailByIdQueryKey,
    getApiCampaignStatisticDropdownQueryKey,
    postApiCampaignStatisticSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCampaignStatisticRequest, UpdateCampaignStatisticRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCampaignStatisticMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCampaignStatisticDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCampaignStatisticSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["campaignStatistic", "search"] })
    }

    const createCampaignStatisticMutation = useMutation({
        ...postApiCampaignStatisticMutation(),
        onSuccess: () => {
            toast.success(t("campaignStatistic.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCampaignStatisticMutation = useMutation({
        ...putApiCampaignStatisticMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("campaignStatistic.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCampaignStatisticByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCampaignStatisticDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCampaignStatisticMutation = useMutation({
        ...deleteApiCampaignStatisticByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("campaignStatistic.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCampaignStatisticByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCampaignStatisticDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("campaignStatistic.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCampaignStatisticByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("campaignStatistic.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("campaignStatistic.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("campaignStatistic.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("campaignStatistic.bulk.deleteError"))
    })

    const createCampaignStatisticWithValidation = (data: CreateCampaignStatisticRequest, setError: UseFormSetError<CreateCampaignStatisticRequest>, onSuccess?: () => void) => {
        createCampaignStatisticMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignStatistic.messages.create.error")
                }),
            },
        )
    }

    const updateCampaignStatisticWithValidation = (data: UpdateCampaignStatisticRequest, setError: UseFormSetError<UpdateCampaignStatisticRequest>, onSuccess?: () => void) => {
        updateCampaignStatisticMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignStatistic.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCampaignStatisticMutation,
        updateMutation: updateCampaignStatisticMutation,
        deleteMutation: deleteCampaignStatisticMutation,
        bulkDeleteMutation,
        createCampaignStatisticWithValidation,
        updateCampaignStatisticWithValidation,
        deleteCampaignStatistic: (id: string) => deleteCampaignStatisticMutation.mutate({ path: { id } }),
        isMutating: createCampaignStatisticMutation.isPending || updateCampaignStatisticMutation.isPending || deleteCampaignStatisticMutation.isPending || bulkDeleteMutation.isPending
    }
}
