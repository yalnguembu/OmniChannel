import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiWebhookEndpointMutation,
    putApiWebhookEndpointMutation,
    deleteApiWebhookEndpointByIdMutation,
    getApiWebhookEndpointByIdQueryKey,
    getApiWebhookEndpointDetailByIdQueryKey,
    getApiWebhookEndpointDropdownQueryKey,
    postApiWebhookEndpointSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateWebhookEndpointRequest, UpdateWebhookEndpointRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useWebhookEndpointMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiWebhookEndpointDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiWebhookEndpointSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["webhookEndpoint", "search"] })
    }

    const createWebhookEndpointMutation = useMutation({
        ...postApiWebhookEndpointMutation(),
        onSuccess: () => {
            toast.success(t("webhookEndpoint.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateWebhookEndpointMutation = useMutation({
        ...putApiWebhookEndpointMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("webhookEndpoint.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiWebhookEndpointByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiWebhookEndpointDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteWebhookEndpointMutation = useMutation({
        ...deleteApiWebhookEndpointByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("webhookEndpoint.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiWebhookEndpointByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiWebhookEndpointDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("webhookEndpoint.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiWebhookEndpointByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("webhookEndpoint.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("webhookEndpoint.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("webhookEndpoint.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("webhookEndpoint.bulk.deleteError"))
    })

    const createWebhookEndpointWithValidation = (data: CreateWebhookEndpointRequest, setError: UseFormSetError<CreateWebhookEndpointRequest>, onSuccess?: () => void) => {
        createWebhookEndpointMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("webhookEndpoint.messages.create.error")
                }),
            },
        )
    }

    const updateWebhookEndpointWithValidation = (data: UpdateWebhookEndpointRequest, setError: UseFormSetError<UpdateWebhookEndpointRequest>, onSuccess?: () => void) => {
        updateWebhookEndpointMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("webhookEndpoint.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createWebhookEndpointMutation,
        updateMutation: updateWebhookEndpointMutation,
        deleteMutation: deleteWebhookEndpointMutation,
        bulkDeleteMutation,
        createWebhookEndpointWithValidation,
        updateWebhookEndpointWithValidation,
        deleteWebhookEndpoint: (id: string) => deleteWebhookEndpointMutation.mutate({ path: { id } }),
        isMutating: createWebhookEndpointMutation.isPending || updateWebhookEndpointMutation.isPending || deleteWebhookEndpointMutation.isPending || bulkDeleteMutation.isPending
    }
}
