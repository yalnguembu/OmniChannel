import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCompanySettingMutation,
    putApiCompanySettingMutation,
    deleteApiCompanySettingByIdMutation,
    getApiCompanySettingByIdQueryKey,
    getApiCompanySettingDetailByIdQueryKey,
    getApiCompanySettingDropdownQueryKey,
    postApiCompanySettingSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCompanySettingRequest, UpdateCompanySettingRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCompanySettingMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCompanySettingDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCompanySettingSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["companySetting", "search"] })
    }

    const createCompanySettingMutation = useMutation({
        ...postApiCompanySettingMutation(),
        onSuccess: () => {
            toast.success(t("companySetting.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCompanySettingMutation = useMutation({
        ...putApiCompanySettingMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("companySetting.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCompanySettingByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCompanySettingDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCompanySettingMutation = useMutation({
        ...deleteApiCompanySettingByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("companySetting.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCompanySettingByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCompanySettingDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("companySetting.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCompanySettingByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("companySetting.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("companySetting.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("companySetting.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("companySetting.bulk.deleteError"))
    })

    const createCompanySettingWithValidation = (data: CreateCompanySettingRequest, setError: UseFormSetError<CreateCompanySettingRequest>, onSuccess?: () => void) => {
        createCompanySettingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companySetting.messages.create.error")
                }),
            },
        )
    }

    const updateCompanySettingWithValidation = (data: UpdateCompanySettingRequest, setError: UseFormSetError<UpdateCompanySettingRequest>, onSuccess?: () => void) => {
        updateCompanySettingMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companySetting.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCompanySettingMutation,
        updateMutation: updateCompanySettingMutation,
        deleteMutation: deleteCompanySettingMutation,
        bulkDeleteMutation,
        createCompanySettingWithValidation,
        updateCompanySettingWithValidation,
        deleteCompanySetting: (id: string) => deleteCompanySettingMutation.mutate({ path: { id } }),
        isMutating: createCompanySettingMutation.isPending || updateCompanySettingMutation.isPending || deleteCompanySettingMutation.isPending || bulkDeleteMutation.isPending
    }
}
