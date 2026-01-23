import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiProviderCallbackMutation,
    putApiProviderCallbackMutation,
    deleteApiProviderCallbackByIdMutation,
    getApiProviderCallbackByIdQueryKey,
    getApiProviderCallbackDetailByIdQueryKey,
    getApiProviderCallbackDropdownQueryKey,
    postApiProviderCallbackSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateProviderCallbackRequest, UpdateProviderCallbackRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useProviderCallbackMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiProviderCallbackDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiProviderCallbackSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["providerCallback", "search"] })
    }

    const createProviderCallbackMutation = useMutation({
        ...postApiProviderCallbackMutation(),
        onSuccess: () => {
            toast.success(t("providerCallback.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateProviderCallbackMutation = useMutation({
        ...putApiProviderCallbackMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("providerCallback.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiProviderCallbackByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiProviderCallbackDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteProviderCallbackMutation = useMutation({
        ...deleteApiProviderCallbackByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("providerCallback.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiProviderCallbackByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiProviderCallbackDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("providerCallback.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiProviderCallbackByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("providerCallback.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("providerCallback.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("providerCallback.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("providerCallback.bulk.deleteError"))
    })

    const createProviderCallbackWithValidation = (data: CreateProviderCallbackRequest, setError: UseFormSetError<CreateProviderCallbackRequest>, onSuccess?: () => void) => {
        createProviderCallbackMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("providerCallback.messages.create.error")
                }),
            },
        )
    }

    const updateProviderCallbackWithValidation = (data: UpdateProviderCallbackRequest, setError: UseFormSetError<UpdateProviderCallbackRequest>, onSuccess?: () => void) => {
        updateProviderCallbackMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("providerCallback.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createProviderCallbackMutation,
        updateMutation: updateProviderCallbackMutation,
        deleteMutation: deleteProviderCallbackMutation,
        bulkDeleteMutation,
        createProviderCallbackWithValidation,
        updateProviderCallbackWithValidation,
        deleteProviderCallback: (id: string) => deleteProviderCallbackMutation.mutate({ path: { id } }),
        isMutating: createProviderCallbackMutation.isPending || updateProviderCallbackMutation.isPending || deleteProviderCallbackMutation.isPending || bulkDeleteMutation.isPending
    }
}
