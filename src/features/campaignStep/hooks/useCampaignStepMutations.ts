import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCampaignStepMutation,
    putApiCampaignStepMutation,
    deleteApiCampaignStepByIdMutation,
    getApiCampaignStepByIdQueryKey,
    getApiCampaignStepDetailByIdQueryKey,
    getApiCampaignStepDropdownQueryKey,
    postApiCampaignStepSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCampaignStepRequest, UpdateCampaignStepRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCampaignStepMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCampaignStepDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCampaignStepSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["campaignStep", "search"] })
    }

    const createCampaignStepMutation = useMutation({
        ...postApiCampaignStepMutation(),
        onSuccess: () => {
            toast.success(t("campaignStep.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCampaignStepMutation = useMutation({
        ...putApiCampaignStepMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("campaignStep.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCampaignStepByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCampaignStepDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCampaignStepMutation = useMutation({
        ...deleteApiCampaignStepByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("campaignStep.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCampaignStepByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCampaignStepDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("campaignStep.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCampaignStepByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("campaignStep.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("campaignStep.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("campaignStep.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("campaignStep.bulk.deleteError"))
    })

    const createCampaignStepWithValidation = (data: CreateCampaignStepRequest, setError: UseFormSetError<CreateCampaignStepRequest>, onSuccess?: () => void) => {
        createCampaignStepMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignStep.messages.create.error")
                }),
            },
        )
    }

    const updateCampaignStepWithValidation = (data: UpdateCampaignStepRequest, setError: UseFormSetError<UpdateCampaignStepRequest>, onSuccess?: () => void) => {
        updateCampaignStepMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignStep.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCampaignStepMutation,
        updateMutation: updateCampaignStepMutation,
        deleteMutation: deleteCampaignStepMutation,
        bulkDeleteMutation,
        createCampaignStepWithValidation,
        updateCampaignStepWithValidation,
        deleteCampaignStep: (id: string) => deleteCampaignStepMutation.mutate({ path: { id } }),
        isMutating: createCampaignStepMutation.isPending || updateCampaignStepMutation.isPending || deleteCampaignStepMutation.isPending || bulkDeleteMutation.isPending
    }
}
