import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiSettingMutation,
    putApiSettingMutation,
    deleteApiSettingByIdMutation,
    getApiSettingByIdQueryKey,
    getApiSettingDetailByIdQueryKey,
    getApiSettingDropdownQueryKey,
    postApiSettingSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateSettingRequest, UpdateSettingRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useSettingMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiSettingDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiSettingSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["setting", "search"] })
    }

    const createSettingMutation = useMutation({
        ...postApiSettingMutation(),
        onSuccess: () => {
            toast.success(t("setting.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateSettingMutation = useMutation({
        ...putApiSettingMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("setting.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiSettingByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiSettingDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteSettingMutation = useMutation({
        ...deleteApiSettingByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("setting.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiSettingByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiSettingDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("setting.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiSettingByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("setting.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("setting.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("setting.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("setting.bulk.deleteError"))
    })

    const createSettingWithValidation = (data: CreateSettingRequest, setError: UseFormSetError<CreateSettingRequest>, onSuccess?: () => void) => {
        createSettingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("setting.messages.create.error")
                }),
            },
        )
    }

    const updateSettingWithValidation = (data: UpdateSettingRequest, setError: UseFormSetError<UpdateSettingRequest>, onSuccess?: () => void) => {
        updateSettingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("setting.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createSettingMutation,
        updateMutation: updateSettingMutation,
        deleteMutation: deleteSettingMutation,
        bulkDeleteMutation,
        createSettingWithValidation,
        updateSettingWithValidation,
        deleteSetting: (id: string) => deleteSettingMutation.mutate({ path: { id } }),
        isMutating: createSettingMutation.isPending || updateSettingMutation.isPending || deleteSettingMutation.isPending || bulkDeleteMutation.isPending
    }
}
