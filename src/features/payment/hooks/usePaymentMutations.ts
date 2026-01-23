import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiPaymentMutation,
    putApiPaymentMutation,
    deleteApiPaymentByIdMutation,
    getApiPaymentByIdQueryKey,
    getApiPaymentDetailByIdQueryKey,
    getApiPaymentDropdownQueryKey,
    postApiPaymentSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreatePaymentRequest, UpdatePaymentRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const usePaymentMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiPaymentDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiPaymentSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["payment", "search"] })
    }

    const createPaymentMutation = useMutation({
        ...postApiPaymentMutation(),
        onSuccess: () => {
            toast.success(t("payment.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updatePaymentMutation = useMutation({
        ...putApiPaymentMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("payment.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiPaymentByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiPaymentDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deletePaymentMutation = useMutation({
        ...deleteApiPaymentByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("payment.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiPaymentByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiPaymentDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("payment.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiPaymentByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("payment.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("payment.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("payment.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("payment.bulk.deleteError"))
    })

    const createPaymentWithValidation = (data: CreatePaymentRequest, setError: UseFormSetError<CreatePaymentRequest>, onSuccess?: () => void) => {
        createPaymentMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("payment.messages.create.error")
                }),
            },
        )
    }

    const updatePaymentWithValidation = (data: UpdatePaymentRequest, setError: UseFormSetError<UpdatePaymentRequest>, onSuccess?: () => void) => {
        updatePaymentMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("payment.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createPaymentMutation,
        updateMutation: updatePaymentMutation,
        deleteMutation: deletePaymentMutation,
        bulkDeleteMutation,
        createPaymentWithValidation,
        updatePaymentWithValidation,
        deletePayment: (id: string) => deletePaymentMutation.mutate({ path: { id } }),
        isMutating: createPaymentMutation.isPending || updatePaymentMutation.isPending || deletePaymentMutation.isPending || bulkDeleteMutation.isPending
    }
}
