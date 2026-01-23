import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiNotificationMutation,
    putApiNotificationMutation,
    deleteApiNotificationByIdMutation,
    getApiNotificationByIdQueryKey,
    getApiNotificationDetailByIdQueryKey,
    getApiNotificationDropdownQueryKey,
    postApiNotificationSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateNotificationRequest, UpdateNotificationRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useNotificationMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiNotificationDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiNotificationSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["notification", "search"] })
    }

    const createNotificationMutation = useMutation({
        ...postApiNotificationMutation(),
        onSuccess: () => {
            toast.success(t("notification.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateNotificationMutation = useMutation({
        ...putApiNotificationMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("notification.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiNotificationByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiNotificationDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteNotificationMutation = useMutation({
        ...deleteApiNotificationByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("notification.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiNotificationByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiNotificationDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("notification.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiNotificationByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("notification.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("notification.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("notification.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("notification.bulk.deleteError"))
    })

    const createNotificationWithValidation = (data: CreateNotificationRequest, setError: UseFormSetError<CreateNotificationRequest>, onSuccess?: () => void) => {
        createNotificationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("notification.messages.create.error")
                }),
            },
        )
    }

    const updateNotificationWithValidation = (data: UpdateNotificationRequest, setError: UseFormSetError<UpdateNotificationRequest>, onSuccess?: () => void) => {
        updateNotificationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("notification.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createNotificationMutation,
        updateMutation: updateNotificationMutation,
        deleteMutation: deleteNotificationMutation,
        bulkDeleteMutation,
        createNotificationWithValidation,
        updateNotificationWithValidation,
        deleteNotification: (id: string) => deleteNotificationMutation.mutate({ path: { id } }),
        isMutating: createNotificationMutation.isPending || updateNotificationMutation.isPending || deleteNotificationMutation.isPending || bulkDeleteMutation.isPending
    }
}
