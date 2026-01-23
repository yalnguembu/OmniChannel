import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiSecureSettingMutation,
    putApiSecureSettingMutation,
    deleteApiSecureSettingByIdMutation,
    getApiSecureSettingByIdQueryKey,
    getApiSecureSettingDetailByIdQueryKey,
    getApiSecureSettingDropdownQueryKey,
    postApiSecureSettingSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateSecureSettingRequest, UpdateSecureSettingRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useSecureSettingMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiSecureSettingDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiSecureSettingSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["secureSetting", "search"] })
    }

    const createSecureSettingMutation = useMutation({
        ...postApiSecureSettingMutation(),
        onSuccess: () => {
            toast.success(t("secureSetting.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateSecureSettingMutation = useMutation({
        ...putApiSecureSettingMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("secureSetting.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiSecureSettingByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiSecureSettingDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteSecureSettingMutation = useMutation({
        ...deleteApiSecureSettingByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("secureSetting.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiSecureSettingByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiSecureSettingDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("secureSetting.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiSecureSettingByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("secureSetting.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("secureSetting.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("secureSetting.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("secureSetting.bulk.deleteError"))
    })

    const createSecureSettingWithValidation = (data: CreateSecureSettingRequest, setError: UseFormSetError<CreateSecureSettingRequest>, onSuccess?: () => void) => {
        createSecureSettingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("secureSetting.messages.create.error")
                }),
            },
        )
    }

    const updateSecureSettingWithValidation = (data: UpdateSecureSettingRequest, setError: UseFormSetError<UpdateSecureSettingRequest>, onSuccess?: () => void) => {
        updateSecureSettingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("secureSetting.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createSecureSettingMutation,
        updateMutation: updateSecureSettingMutation,
        deleteMutation: deleteSecureSettingMutation,
        bulkDeleteMutation,
        createSecureSettingWithValidation,
        updateSecureSettingWithValidation,
        deleteSecureSetting: (id: string) => deleteSecureSettingMutation.mutate({ path: { id } }),
        isMutating: createSecureSettingMutation.isPending || updateSecureSettingMutation.isPending || deleteSecureSettingMutation.isPending || bulkDeleteMutation.isPending
    }
}
