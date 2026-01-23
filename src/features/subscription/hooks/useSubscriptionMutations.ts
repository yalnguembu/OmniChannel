import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiSubscriptionMutation,
    putApiSubscriptionMutation,
    deleteApiSubscriptionByIdMutation,
    getApiSubscriptionByIdQueryKey,
    getApiSubscriptionDetailByIdQueryKey,
    getApiSubscriptionDropdownQueryKey,
    postApiSubscriptionSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateSubscriptionRequest, UpdateSubscriptionRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useSubscriptionMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiSubscriptionDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiSubscriptionSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["subscription", "search"] })
    }

    const createSubscriptionMutation = useMutation({
        ...postApiSubscriptionMutation(),
        onSuccess: () => {
            toast.success(t("subscription.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateSubscriptionMutation = useMutation({
        ...putApiSubscriptionMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("subscription.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiSubscriptionByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiSubscriptionDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteSubscriptionMutation = useMutation({
        ...deleteApiSubscriptionByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("subscription.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiSubscriptionByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiSubscriptionDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("subscription.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiSubscriptionByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("subscription.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("subscription.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("subscription.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("subscription.bulk.deleteError"))
    })

    const createSubscriptionWithValidation = (data: CreateSubscriptionRequest, setError: UseFormSetError<CreateSubscriptionRequest>, onSuccess?: () => void) => {
        createSubscriptionMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("subscription.messages.create.error")
                }),
            },
        )
    }

    const updateSubscriptionWithValidation = (data: UpdateSubscriptionRequest, setError: UseFormSetError<UpdateSubscriptionRequest>, onSuccess?: () => void) => {
        updateSubscriptionMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("subscription.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createSubscriptionMutation,
        updateMutation: updateSubscriptionMutation,
        deleteMutation: deleteSubscriptionMutation,
        bulkDeleteMutation,
        createSubscriptionWithValidation,
        updateSubscriptionWithValidation,
        deleteSubscription: (id: string) => deleteSubscriptionMutation.mutate({ path: { id } }),
        isMutating: createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending || deleteSubscriptionMutation.isPending || bulkDeleteMutation.isPending
    }
}
