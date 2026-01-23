import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCampaignMutation,
    putApiCampaignMutation,
    deleteApiCampaignByIdMutation,
    getApiCampaignByIdQueryKey,
    getApiCampaignDetailByIdQueryKey,
    getApiCampaignDropdownQueryKey,
    postApiCampaignSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCampaignRequest, UpdateCampaignRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCampaignMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCampaignDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCampaignSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["campaign", "search"] })
    }

    const createCampaignMutation = useMutation({
        ...postApiCampaignMutation(),
        onSuccess: () => {
            toast.success(t("campaign.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCampaignMutation = useMutation({
        ...putApiCampaignMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("campaign.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCampaignByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCampaignDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCampaignMutation = useMutation({
        ...deleteApiCampaignByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("campaign.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCampaignByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCampaignDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("campaign.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCampaignByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("campaign.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("campaign.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("campaign.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("campaign.bulk.deleteError"))
    })

    const createCampaignWithValidation = (data: CreateCampaignRequest, setError: UseFormSetError<CreateCampaignRequest>, onSuccess?: () => void) => {
        createCampaignMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaign.messages.create.error")
                }),
            },
        )
    }

    const updateCampaignWithValidation = (data: UpdateCampaignRequest, setError: UseFormSetError<UpdateCampaignRequest>, onSuccess?: () => void) => {
        updateCampaignMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaign.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCampaignMutation,
        updateMutation: updateCampaignMutation,
        deleteMutation: deleteCampaignMutation,
        bulkDeleteMutation,
        createCampaignWithValidation,
        updateCampaignWithValidation,
        deleteCampaign: (id: string) => deleteCampaignMutation.mutate({ path: { id } }),
        isMutating: createCampaignMutation.isPending || updateCampaignMutation.isPending || deleteCampaignMutation.isPending || bulkDeleteMutation.isPending
    }
}
