import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiIntegrationMutation,
    putApiIntegrationMutation,
    deleteApiIntegrationByIdMutation,
    getApiIntegrationByIdQueryKey,
    getApiIntegrationDetailByIdQueryKey,
    getApiIntegrationDropdownQueryKey,
    postApiIntegrationSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateIntegrationRequest, UpdateIntegrationRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useIntegrationMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiIntegrationDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiIntegrationSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["integration", "search"] })
    }

    const createIntegrationMutation = useMutation({
        ...postApiIntegrationMutation(),
        onSuccess: () => {
            toast.success(t("integration.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateIntegrationMutation = useMutation({
        ...putApiIntegrationMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("integration.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiIntegrationByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiIntegrationDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteIntegrationMutation = useMutation({
        ...deleteApiIntegrationByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("integration.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiIntegrationByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiIntegrationDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("integration.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiIntegrationByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("integration.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("integration.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("integration.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("integration.bulk.deleteError"))
    })

    const createIntegrationWithValidation = (data: CreateIntegrationRequest, setError: UseFormSetError<CreateIntegrationRequest>, onSuccess?: () => void) => {
        createIntegrationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("integration.messages.create.error")
                }),
            },
        )
    }

    const updateIntegrationWithValidation = (data: UpdateIntegrationRequest, setError: UseFormSetError<UpdateIntegrationRequest>, onSuccess?: () => void) => {
        updateIntegrationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("integration.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createIntegrationMutation,
        updateMutation: updateIntegrationMutation,
        deleteMutation: deleteIntegrationMutation,
        bulkDeleteMutation,
        createIntegrationWithValidation,
        updateIntegrationWithValidation,
        deleteIntegration: (id: string) => deleteIntegrationMutation.mutate({ path: { id } }),
        isMutating: createIntegrationMutation.isPending || updateIntegrationMutation.isPending || deleteIntegrationMutation.isPending || bulkDeleteMutation.isPending
    }
}
