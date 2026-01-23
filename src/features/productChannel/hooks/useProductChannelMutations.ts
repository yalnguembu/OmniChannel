import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiProductChannelMutation,
    putApiProductChannelMutation,
    deleteApiProductChannelByIdMutation,
    getApiProductChannelByIdQueryKey,
    getApiProductChannelDetailByIdQueryKey,
    getApiProductChannelDropdownQueryKey,
    postApiProductChannelSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateProductChannelRequest, UpdateProductChannelRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useProductChannelMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiProductChannelDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiProductChannelSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["productChannel", "search"] })
    }

    const createProductChannelMutation = useMutation({
        ...postApiProductChannelMutation(),
        onSuccess: () => {
            toast.success(t("productChannel.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateProductChannelMutation = useMutation({
        ...putApiProductChannelMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("productChannel.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiProductChannelByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiProductChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteProductChannelMutation = useMutation({
        ...deleteApiProductChannelByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("productChannel.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiProductChannelByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiProductChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("productChannel.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiProductChannelByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("productChannel.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("productChannel.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("productChannel.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("productChannel.bulk.deleteError"))
    })

    const createProductChannelWithValidation = (data: CreateProductChannelRequest, setError: UseFormSetError<CreateProductChannelRequest>, onSuccess?: () => void) => {
        createProductChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("productChannel.messages.create.error")
                }),
            },
        )
    }

    const updateProductChannelWithValidation = (data: UpdateProductChannelRequest, setError: UseFormSetError<UpdateProductChannelRequest>, onSuccess?: () => void) => {
        updateProductChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("productChannel.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createProductChannelMutation,
        updateMutation: updateProductChannelMutation,
        deleteMutation: deleteProductChannelMutation,
        bulkDeleteMutation,
        createProductChannelWithValidation,
        updateProductChannelWithValidation,
        deleteProductChannel: (id: string) => deleteProductChannelMutation.mutate({ path: { id } }),
        isMutating: createProductChannelMutation.isPending || updateProductChannelMutation.isPending || deleteProductChannelMutation.isPending || bulkDeleteMutation.isPending
    }
}
