import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiIntegrationSyncLogMutation,
    putApiIntegrationSyncLogMutation,
    deleteApiIntegrationSyncLogByIdMutation,
    getApiIntegrationSyncLogByIdQueryKey,
    getApiIntegrationSyncLogDetailByIdQueryKey,
    getApiIntegrationSyncLogDropdownQueryKey,
    postApiIntegrationSyncLogSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateIntegrationSyncLogRequest, UpdateIntegrationSyncLogRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useIntegrationSyncLogMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiIntegrationSyncLogDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiIntegrationSyncLogSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["integrationSyncLog", "search"] })
    }

    const createIntegrationSyncLogMutation = useMutation({
        ...postApiIntegrationSyncLogMutation(),
        onSuccess: () => {
            toast.success(t("integrationSyncLog.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateIntegrationSyncLogMutation = useMutation({
        ...putApiIntegrationSyncLogMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("integrationSyncLog.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiIntegrationSyncLogByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiIntegrationSyncLogDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteIntegrationSyncLogMutation = useMutation({
        ...deleteApiIntegrationSyncLogByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("integrationSyncLog.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiIntegrationSyncLogByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiIntegrationSyncLogDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("integrationSyncLog.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiIntegrationSyncLogByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("integrationSyncLog.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("integrationSyncLog.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("integrationSyncLog.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("integrationSyncLog.bulk.deleteError"))
    })

    const createIntegrationSyncLogWithValidation = (data: CreateIntegrationSyncLogRequest, setError: UseFormSetError<CreateIntegrationSyncLogRequest>, onSuccess?: () => void) => {
        createIntegrationSyncLogMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("integrationSyncLog.messages.create.error")
                }),
            },
        )
    }

    const updateIntegrationSyncLogWithValidation = (data: UpdateIntegrationSyncLogRequest, setError: UseFormSetError<UpdateIntegrationSyncLogRequest>, onSuccess?: () => void) => {
        updateIntegrationSyncLogMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("integrationSyncLog.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createIntegrationSyncLogMutation,
        updateMutation: updateIntegrationSyncLogMutation,
        deleteMutation: deleteIntegrationSyncLogMutation,
        bulkDeleteMutation,
        createIntegrationSyncLogWithValidation,
        updateIntegrationSyncLogWithValidation,
        deleteIntegrationSyncLog: (id: string) => deleteIntegrationSyncLogMutation.mutate({ path: { id } }),
        isMutating: createIntegrationSyncLogMutation.isPending || updateIntegrationSyncLogMutation.isPending || deleteIntegrationSyncLogMutation.isPending || bulkDeleteMutation.isPending
    }
}
