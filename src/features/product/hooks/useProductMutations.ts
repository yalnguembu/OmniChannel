import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiProductMutation,
    putApiProductMutation,
    deleteApiProductByIdMutation,
    getApiProductByIdQueryKey,
    getApiProductDetailByIdQueryKey,
    getApiProductDropdownQueryKey,
    postApiProductSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateProductRequest, UpdateProductRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useProductMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiProductDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiProductSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["product", "search"] })
    }

    const createProductMutation = useMutation({
        ...postApiProductMutation(),
        onSuccess: () => {
            toast.success(t("product.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateProductMutation = useMutation({
        ...putApiProductMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("product.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiProductByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiProductDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteProductMutation = useMutation({
        ...deleteApiProductByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("product.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiProductByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiProductDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("product.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiProductByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("product.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("product.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("product.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("product.bulk.deleteError"))
    })

    const createProductWithValidation = (data: CreateProductRequest, setError: UseFormSetError<CreateProductRequest>, onSuccess?: () => void) => {
        createProductMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("product.messages.create.error")
                }),
            },
        )
    }

    const updateProductWithValidation = (data: UpdateProductRequest, setError: UseFormSetError<UpdateProductRequest>, onSuccess?: () => void) => {
        updateProductMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("product.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createProductMutation,
        updateMutation: updateProductMutation,
        deleteMutation: deleteProductMutation,
        bulkDeleteMutation,
        createProductWithValidation,
        updateProductWithValidation,
        deleteProduct: (id: string) => deleteProductMutation.mutate({ path: { id } }),
        isMutating: createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending || bulkDeleteMutation.isPending
    }
}
