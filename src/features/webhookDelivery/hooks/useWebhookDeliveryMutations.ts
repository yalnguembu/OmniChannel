import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiWebhookDeliveryMutation,
    putApiWebhookDeliveryMutation,
    deleteApiWebhookDeliveryByIdMutation,
    getApiWebhookDeliveryByIdQueryKey,
    getApiWebhookDeliveryDetailByIdQueryKey,
    getApiWebhookDeliveryDropdownQueryKey,
    postApiWebhookDeliverySearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateWebhookDeliveryRequest, UpdateWebhookDeliveryRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useWebhookDeliveryMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiWebhookDeliveryDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiWebhookDeliverySearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["webhookDelivery", "search"] })
    }

    const createWebhookDeliveryMutation = useMutation({
        ...postApiWebhookDeliveryMutation(),
        onSuccess: () => {
            toast.success(t("webhookDelivery.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateWebhookDeliveryMutation = useMutation({
        ...putApiWebhookDeliveryMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("webhookDelivery.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiWebhookDeliveryByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiWebhookDeliveryDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteWebhookDeliveryMutation = useMutation({
        ...deleteApiWebhookDeliveryByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("webhookDelivery.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiWebhookDeliveryByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiWebhookDeliveryDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("webhookDelivery.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiWebhookDeliveryByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("webhookDelivery.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("webhookDelivery.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("webhookDelivery.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("webhookDelivery.bulk.deleteError"))
    })

    const createWebhookDeliveryWithValidation = (data: CreateWebhookDeliveryRequest, setError: UseFormSetError<CreateWebhookDeliveryRequest>, onSuccess?: () => void) => {
        createWebhookDeliveryMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("webhookDelivery.messages.create.error")
                }),
            },
        )
    }

    const updateWebhookDeliveryWithValidation = (data: UpdateWebhookDeliveryRequest, setError: UseFormSetError<UpdateWebhookDeliveryRequest>, onSuccess?: () => void) => {
        updateWebhookDeliveryMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("webhookDelivery.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createWebhookDeliveryMutation,
        updateMutation: updateWebhookDeliveryMutation,
        deleteMutation: deleteWebhookDeliveryMutation,
        bulkDeleteMutation,
        createWebhookDeliveryWithValidation,
        updateWebhookDeliveryWithValidation,
        deleteWebhookDelivery: (id: string) => deleteWebhookDeliveryMutation.mutate({ path: { id } }),
        isMutating: createWebhookDeliveryMutation.isPending || updateWebhookDeliveryMutation.isPending || deleteWebhookDeliveryMutation.isPending || bulkDeleteMutation.isPending
    }
}
