import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCampaignSegmentMutation,
    putApiCampaignSegmentMutation,
    deleteApiCampaignSegmentByIdMutation,
    getApiCampaignSegmentByIdQueryKey,
    getApiCampaignSegmentDetailByIdQueryKey,
    getApiCampaignSegmentDropdownQueryKey,
    postApiCampaignSegmentSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCampaignSegmentRequest, UpdateCampaignSegmentRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCampaignSegmentMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCampaignSegmentDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCampaignSegmentSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["campaignSegment", "search"] })
    }

    const createCampaignSegmentMutation = useMutation({
        ...postApiCampaignSegmentMutation(),
        onSuccess: () => {
            toast.success(t("campaignSegment.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCampaignSegmentMutation = useMutation({
        ...putApiCampaignSegmentMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("campaignSegment.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCampaignSegmentByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCampaignSegmentDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCampaignSegmentMutation = useMutation({
        ...deleteApiCampaignSegmentByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("campaignSegment.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCampaignSegmentByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCampaignSegmentDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("campaignSegment.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCampaignSegmentByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("campaignSegment.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("campaignSegment.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("campaignSegment.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("campaignSegment.bulk.deleteError"))
    })

    const createCampaignSegmentWithValidation = (data: CreateCampaignSegmentRequest, setError: UseFormSetError<CreateCampaignSegmentRequest>, onSuccess?: () => void) => {
        createCampaignSegmentMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignSegment.messages.create.error")
                }),
            },
        )
    }

    const updateCampaignSegmentWithValidation = (data: UpdateCampaignSegmentRequest, setError: UseFormSetError<UpdateCampaignSegmentRequest>, onSuccess?: () => void) => {
        updateCampaignSegmentMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignSegment.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCampaignSegmentMutation,
        updateMutation: updateCampaignSegmentMutation,
        deleteMutation: deleteCampaignSegmentMutation,
        bulkDeleteMutation,
        createCampaignSegmentWithValidation,
        updateCampaignSegmentWithValidation,
        deleteCampaignSegment: (id: string) => deleteCampaignSegmentMutation.mutate({ path: { id } }),
        isMutating: createCampaignSegmentMutation.isPending || updateCampaignSegmentMutation.isPending || deleteCampaignSegmentMutation.isPending || bulkDeleteMutation.isPending
    }
}
