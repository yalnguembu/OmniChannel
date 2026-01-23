import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiMessageMutation,
    putApiMessageMutation,
    deleteApiMessageByIdMutation,
    getApiMessageByIdQueryKey,
    getApiMessageDetailByIdQueryKey,
    getApiMessageDropdownQueryKey,
    postApiMessageSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateMessageRequest, UpdateMessageRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useMessageMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiMessageDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiMessageSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["message", "search"] })
    }

    const createMessageMutation = useMutation({
        ...postApiMessageMutation(),
        onSuccess: () => {
            toast.success(t("message.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateMessageMutation = useMutation({
        ...putApiMessageMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("message.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiMessageByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiMessageDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteMessageMutation = useMutation({
        ...deleteApiMessageByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("message.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiMessageByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiMessageDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("message.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiMessageByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("message.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("message.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("message.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("message.bulk.deleteError"))
    })

    const createMessageWithValidation = (data: CreateMessageRequest, setError: UseFormSetError<CreateMessageRequest>, onSuccess?: () => void) => {
        createMessageMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("message.messages.create.error")
                }),
            },
        )
    }

    const updateMessageWithValidation = (data: UpdateMessageRequest, setError: UseFormSetError<UpdateMessageRequest>, onSuccess?: () => void) => {
        updateMessageMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("message.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createMessageMutation,
        updateMutation: updateMessageMutation,
        deleteMutation: deleteMessageMutation,
        bulkDeleteMutation,
        createMessageWithValidation,
        updateMessageWithValidation,
        deleteMessage: (id: string) => deleteMessageMutation.mutate({ path: { id } }),
        isMutating: createMessageMutation.isPending || updateMessageMutation.isPending || deleteMessageMutation.isPending || bulkDeleteMutation.isPending
    }
}
