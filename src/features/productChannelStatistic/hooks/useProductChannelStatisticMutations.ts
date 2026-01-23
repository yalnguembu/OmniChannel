import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiProductChannelStatisticMutation,
    putApiProductChannelStatisticMutation,
    deleteApiProductChannelStatisticByIdMutation,
    getApiProductChannelStatisticByIdQueryKey,
    getApiProductChannelStatisticDetailByIdQueryKey,
    getApiProductChannelStatisticDropdownQueryKey,
    postApiProductChannelStatisticSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateProductChannelStatisticRequest, UpdateProductChannelStatisticRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useProductChannelStatisticMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiProductChannelStatisticDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiProductChannelStatisticSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["productChannelStatistic", "search"] })
    }

    const createProductChannelStatisticMutation = useMutation({
        ...postApiProductChannelStatisticMutation(),
        onSuccess: () => {
            toast.success(t("productChannelStatistic.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateProductChannelStatisticMutation = useMutation({
        ...putApiProductChannelStatisticMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("productChannelStatistic.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiProductChannelStatisticByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiProductChannelStatisticDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteProductChannelStatisticMutation = useMutation({
        ...deleteApiProductChannelStatisticByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("productChannelStatistic.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiProductChannelStatisticByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiProductChannelStatisticDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("productChannelStatistic.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiProductChannelStatisticByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("productChannelStatistic.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("productChannelStatistic.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("productChannelStatistic.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("productChannelStatistic.bulk.deleteError"))
    })

    const createProductChannelStatisticWithValidation = (data: CreateProductChannelStatisticRequest, setError: UseFormSetError<CreateProductChannelStatisticRequest>, onSuccess?: () => void) => {
        createProductChannelStatisticMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("productChannelStatistic.messages.create.error")
                }),
            },
        )
    }

    const updateProductChannelStatisticWithValidation = (data: UpdateProductChannelStatisticRequest, setError: UseFormSetError<UpdateProductChannelStatisticRequest>, onSuccess?: () => void) => {
        updateProductChannelStatisticMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("productChannelStatistic.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createProductChannelStatisticMutation,
        updateMutation: updateProductChannelStatisticMutation,
        deleteMutation: deleteProductChannelStatisticMutation,
        bulkDeleteMutation,
        createProductChannelStatisticWithValidation,
        updateProductChannelStatisticWithValidation,
        deleteProductChannelStatistic: (id: string) => deleteProductChannelStatisticMutation.mutate({ path: { id } }),
        isMutating: createProductChannelStatisticMutation.isPending || updateProductChannelStatisticMutation.isPending || deleteProductChannelStatisticMutation.isPending || bulkDeleteMutation.isPending
    }
}
