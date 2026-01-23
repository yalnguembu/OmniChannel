import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiPricingMutation,
    putApiPricingMutation,
    deleteApiPricingByIdMutation,
    getApiPricingByIdQueryKey,
    getApiPricingDetailByIdQueryKey,
    getApiPricingDropdownQueryKey,
    postApiPricingSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreatePricingRequest, UpdatePricingRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const usePricingMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiPricingDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiPricingSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["pricing", "search"] })
    }

    const createPricingMutation = useMutation({
        ...postApiPricingMutation(),
        onSuccess: () => {
            toast.success(t("pricing.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updatePricingMutation = useMutation({
        ...putApiPricingMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("pricing.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiPricingByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiPricingDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deletePricingMutation = useMutation({
        ...deleteApiPricingByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("pricing.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiPricingByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiPricingDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("pricing.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiPricingByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("pricing.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("pricing.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("pricing.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("pricing.bulk.deleteError"))
    })

    const createPricingWithValidation = (data: CreatePricingRequest, setError: UseFormSetError<CreatePricingRequest>, onSuccess?: () => void) => {
        createPricingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("pricing.messages.create.error")
                }),
            },
        )
    }

    const updatePricingWithValidation = (data: UpdatePricingRequest, setError: UseFormSetError<UpdatePricingRequest>, onSuccess?: () => void) => {
        updatePricingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("pricing.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createPricingMutation,
        updateMutation: updatePricingMutation,
        deleteMutation: deletePricingMutation,
        bulkDeleteMutation,
        createPricingWithValidation,
        updatePricingWithValidation,
        deletePricing: (id: string) => deletePricingMutation.mutate({ path: { id } }),
        isMutating: createPricingMutation.isPending || updatePricingMutation.isPending || deletePricingMutation.isPending || bulkDeleteMutation.isPending
    }
}
