import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiPaymentMethodMutation,
    putApiPaymentMethodMutation,
    deleteApiPaymentMethodByIdMutation,
    getApiPaymentMethodByIdQueryKey,
    getApiPaymentMethodDetailByIdQueryKey,
    getApiPaymentMethodDropdownQueryKey,
    postApiPaymentMethodSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const usePaymentMethodMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiPaymentMethodDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiPaymentMethodSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["paymentMethod", "search"] })
    }

    const createPaymentMethodMutation = useMutation({
        ...postApiPaymentMethodMutation(),
        onSuccess: () => {
            toast.success(t("paymentMethod.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updatePaymentMethodMutation = useMutation({
        ...putApiPaymentMethodMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("paymentMethod.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiPaymentMethodByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiPaymentMethodDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deletePaymentMethodMutation = useMutation({
        ...deleteApiPaymentMethodByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("paymentMethod.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiPaymentMethodByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiPaymentMethodDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("paymentMethod.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiPaymentMethodByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("paymentMethod.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("paymentMethod.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("paymentMethod.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("paymentMethod.bulk.deleteError"))
    })

    const createPaymentMethodWithValidation = (data: CreatePaymentMethodRequest, setError: UseFormSetError<CreatePaymentMethodRequest>, onSuccess?: () => void) => {
        createPaymentMethodMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("paymentMethod.messages.create.error")
                }),
            },
        )
    }

    const updatePaymentMethodWithValidation = (data: UpdatePaymentMethodRequest, setError: UseFormSetError<UpdatePaymentMethodRequest>, onSuccess?: () => void) => {
        updatePaymentMethodMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("paymentMethod.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createPaymentMethodMutation,
        updateMutation: updatePaymentMethodMutation,
        deleteMutation: deletePaymentMethodMutation,
        bulkDeleteMutation,
        createPaymentMethodWithValidation,
        updatePaymentMethodWithValidation,
        deletePaymentMethod: (id: string) => deletePaymentMethodMutation.mutate({ path: { id } }),
        isMutating: createPaymentMethodMutation.isPending || updatePaymentMethodMutation.isPending || deletePaymentMethodMutation.isPending || bulkDeleteMutation.isPending
    }
}
