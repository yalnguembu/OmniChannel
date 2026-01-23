import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiMessageEventMutation,
    putApiMessageEventMutation,
    deleteApiMessageEventByIdMutation,
    getApiMessageEventByIdQueryKey,
    getApiMessageEventDetailByIdQueryKey,
    getApiMessageEventDropdownQueryKey,
    postApiMessageEventSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateMessageEventRequest, UpdateMessageEventRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useMessageEventMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiMessageEventDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiMessageEventSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["messageEvent", "search"] })
    }

    const createMessageEventMutation = useMutation({
        ...postApiMessageEventMutation(),
        onSuccess: () => {
            toast.success(t("messageEvent.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateMessageEventMutation = useMutation({
        ...putApiMessageEventMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("messageEvent.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiMessageEventByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiMessageEventDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteMessageEventMutation = useMutation({
        ...deleteApiMessageEventByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("messageEvent.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiMessageEventByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiMessageEventDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("messageEvent.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiMessageEventByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("messageEvent.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("messageEvent.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("messageEvent.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("messageEvent.bulk.deleteError"))
    })

    const createMessageEventWithValidation = (data: CreateMessageEventRequest, setError: UseFormSetError<CreateMessageEventRequest>, onSuccess?: () => void) => {
        createMessageEventMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("messageEvent.messages.create.error")
                }),
            },
        )
    }

    const updateMessageEventWithValidation = (data: UpdateMessageEventRequest, setError: UseFormSetError<UpdateMessageEventRequest>, onSuccess?: () => void) => {
        updateMessageEventMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("messageEvent.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createMessageEventMutation,
        updateMutation: updateMessageEventMutation,
        deleteMutation: deleteMessageEventMutation,
        bulkDeleteMutation,
        createMessageEventWithValidation,
        updateMessageEventWithValidation,
        deleteMessageEvent: (id: string) => deleteMessageEventMutation.mutate({ path: { id } }),
        isMutating: createMessageEventMutation.isPending || updateMessageEventMutation.isPending || deleteMessageEventMutation.isPending || bulkDeleteMutation.isPending
    }
}
