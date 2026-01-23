import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiInvoiceMutation,
    putApiInvoiceMutation,
    deleteApiInvoiceByIdMutation,
    getApiInvoiceByIdQueryKey,
    getApiInvoiceDetailByIdQueryKey,
    getApiInvoiceDropdownQueryKey,
    postApiInvoiceSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateInvoiceRequest, UpdateInvoiceRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useInvoiceMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiInvoiceDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiInvoiceSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["invoice", "search"] })
    }

    const createInvoiceMutation = useMutation({
        ...postApiInvoiceMutation(),
        onSuccess: () => {
            toast.success(t("invoice.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateInvoiceMutation = useMutation({
        ...putApiInvoiceMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("invoice.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiInvoiceByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiInvoiceDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteInvoiceMutation = useMutation({
        ...deleteApiInvoiceByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("invoice.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiInvoiceByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiInvoiceDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("invoice.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiInvoiceByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("invoice.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("invoice.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("invoice.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("invoice.bulk.deleteError"))
    })

    const createInvoiceWithValidation = (data: CreateInvoiceRequest, setError: UseFormSetError<CreateInvoiceRequest>, onSuccess?: () => void) => {
        createInvoiceMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("invoice.messages.create.error")
                }),
            },
        )
    }

    const updateInvoiceWithValidation = (data: UpdateInvoiceRequest, setError: UseFormSetError<UpdateInvoiceRequest>, onSuccess?: () => void) => {
        updateInvoiceMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("invoice.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createInvoiceMutation,
        updateMutation: updateInvoiceMutation,
        deleteMutation: deleteInvoiceMutation,
        bulkDeleteMutation,
        createInvoiceWithValidation,
        updateInvoiceWithValidation,
        deleteInvoice: (id: string) => deleteInvoiceMutation.mutate({ path: { id } }),
        isMutating: createInvoiceMutation.isPending || updateInvoiceMutation.isPending || deleteInvoiceMutation.isPending || bulkDeleteMutation.isPending
    }
}
