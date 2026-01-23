import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCampaignChannelMutation,
    putApiCampaignChannelMutation,
    deleteApiCampaignChannelByIdMutation,
    getApiCampaignChannelByIdQueryKey,
    getApiCampaignChannelDetailByIdQueryKey,
    getApiCampaignChannelDropdownQueryKey,
    postApiCampaignChannelSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCampaignChannelRequest, UpdateCampaignChannelRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCampaignChannelMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCampaignChannelDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCampaignChannelSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["campaignChannel", "search"] })
    }

    const createCampaignChannelMutation = useMutation({
        ...postApiCampaignChannelMutation(),
        onSuccess: () => {
            toast.success(t("campaignChannel.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCampaignChannelMutation = useMutation({
        ...putApiCampaignChannelMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("campaignChannel.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCampaignChannelByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCampaignChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCampaignChannelMutation = useMutation({
        ...deleteApiCampaignChannelByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("campaignChannel.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCampaignChannelByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCampaignChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("campaignChannel.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCampaignChannelByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("campaignChannel.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("campaignChannel.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("campaignChannel.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("campaignChannel.bulk.deleteError"))
    })

    const createCampaignChannelWithValidation = (data: CreateCampaignChannelRequest, setError: UseFormSetError<CreateCampaignChannelRequest>, onSuccess?: () => void) => {
        createCampaignChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignChannel.messages.create.error")
                }),
            },
        )
    }

    const updateCampaignChannelWithValidation = (data: UpdateCampaignChannelRequest, setError: UseFormSetError<UpdateCampaignChannelRequest>, onSuccess?: () => void) => {
        updateCampaignChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("campaignChannel.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCampaignChannelMutation,
        updateMutation: updateCampaignChannelMutation,
        deleteMutation: deleteCampaignChannelMutation,
        bulkDeleteMutation,
        createCampaignChannelWithValidation,
        updateCampaignChannelWithValidation,
        deleteCampaignChannel: (id: string) => deleteCampaignChannelMutation.mutate({ path: { id } }),
        isMutating: createCampaignChannelMutation.isPending || updateCampaignChannelMutation.isPending || deleteCampaignChannelMutation.isPending || bulkDeleteMutation.isPending
    }
}
