import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiSubscriptionPlanMutation,
    putApiSubscriptionPlanMutation,
    deleteApiSubscriptionPlanByIdMutation,
    getApiSubscriptionPlanByIdQueryKey,
    getApiSubscriptionPlanDetailByIdQueryKey,
    getApiSubscriptionPlanDropdownQueryKey,
    postApiSubscriptionPlanSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useSubscriptionPlanMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiSubscriptionPlanDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiSubscriptionPlanSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["subscriptionPlan", "search"] })
    }

    const createSubscriptionPlanMutation = useMutation({
        ...postApiSubscriptionPlanMutation(),
        onSuccess: () => {
            toast.success(t("subscriptionPlan.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateSubscriptionPlanMutation = useMutation({
        ...putApiSubscriptionPlanMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("subscriptionPlan.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiSubscriptionPlanByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiSubscriptionPlanDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteSubscriptionPlanMutation = useMutation({
        ...deleteApiSubscriptionPlanByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("subscriptionPlan.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiSubscriptionPlanByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiSubscriptionPlanDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("subscriptionPlan.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiSubscriptionPlanByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("subscriptionPlan.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("subscriptionPlan.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("subscriptionPlan.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("subscriptionPlan.bulk.deleteError"))
    })

    const createSubscriptionPlanWithValidation = (data: CreateSubscriptionPlanRequest, setError: UseFormSetError<CreateSubscriptionPlanRequest>, onSuccess?: () => void) => {
        createSubscriptionPlanMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("subscriptionPlan.messages.create.error")
                }),
            },
        )
    }

    const updateSubscriptionPlanWithValidation = (data: UpdateSubscriptionPlanRequest, setError: UseFormSetError<UpdateSubscriptionPlanRequest>, onSuccess?: () => void) => {
        updateSubscriptionPlanMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("subscriptionPlan.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createSubscriptionPlanMutation,
        updateMutation: updateSubscriptionPlanMutation,
        deleteMutation: deleteSubscriptionPlanMutation,
        bulkDeleteMutation,
        createSubscriptionPlanWithValidation,
        updateSubscriptionPlanWithValidation,
        deleteSubscriptionPlan: (id: string) => deleteSubscriptionPlanMutation.mutate({ path: { id } }),
        isMutating: createSubscriptionPlanMutation.isPending || updateSubscriptionPlanMutation.isPending || deleteSubscriptionPlanMutation.isPending || bulkDeleteMutation.isPending
    }
}
