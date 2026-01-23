import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiProviderMutation,
    putApiProviderMutation,
    deleteApiProviderByIdMutation,
    getApiProviderByIdQueryKey,
    getApiProviderDetailByIdQueryKey,
    getApiProviderDropdownQueryKey,
    postApiProviderSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateProviderRequest, UpdateProviderRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useProviderMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiProviderDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiProviderSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["provider", "search"] })
    }

    const createProviderMutation = useMutation({
        ...postApiProviderMutation(),
        onSuccess: () => {
            toast.success(t("provider.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateProviderMutation = useMutation({
        ...putApiProviderMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("provider.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiProviderByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiProviderDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteProviderMutation = useMutation({
        ...deleteApiProviderByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("provider.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiProviderByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiProviderDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("provider.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiProviderByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("provider.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("provider.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("provider.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("provider.bulk.deleteError"))
    })

    const createProviderWithValidation = (data: CreateProviderRequest, setError: UseFormSetError<CreateProviderRequest>, onSuccess?: () => void) => {
        createProviderMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("provider.messages.create.error")
                }),
            },
        )
    }

    const updateProviderWithValidation = (data: UpdateProviderRequest, setError: UseFormSetError<UpdateProviderRequest>, onSuccess?: () => void) => {
        updateProviderMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("provider.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createProviderMutation,
        updateMutation: updateProviderMutation,
        deleteMutation: deleteProviderMutation,
        bulkDeleteMutation,
        createProviderWithValidation,
        updateProviderWithValidation,
        deleteProvider: (id: string) => deleteProviderMutation.mutate({ path: { id } }),
        isMutating: createProviderMutation.isPending || updateProviderMutation.isPending || deleteProviderMutation.isPending || bulkDeleteMutation.isPending
    }
}
