import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiAuditLogMutation,
    putApiAuditLogMutation,
    deleteApiAuditLogByIdMutation,
    getApiAuditLogByIdQueryKey,
    getApiAuditLogDetailByIdQueryKey,
    getApiAuditLogDropdownQueryKey,
    postApiAuditLogSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateAuditLogRequest, UpdateAuditLogRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useAuditLogMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiAuditLogDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiAuditLogSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["auditLog", "search"] })
    }

    const createAuditLogMutation = useMutation({
        ...postApiAuditLogMutation(),
        onSuccess: () => {
            toast.success(t("auditLog.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateAuditLogMutation = useMutation({
        ...putApiAuditLogMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("auditLog.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiAuditLogByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiAuditLogDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteAuditLogMutation = useMutation({
        ...deleteApiAuditLogByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("auditLog.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiAuditLogByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiAuditLogDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("auditLog.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiAuditLogByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("auditLog.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("auditLog.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("auditLog.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("auditLog.bulk.deleteError"))
    })

    const createAuditLogWithValidation = (data: CreateAuditLogRequest, setError: UseFormSetError<CreateAuditLogRequest>, onSuccess?: () => void) => {
        createAuditLogMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("auditLog.messages.create.error")
                }),
            },
        )
    }

    const updateAuditLogWithValidation = (data: UpdateAuditLogRequest, setError: UseFormSetError<UpdateAuditLogRequest>, onSuccess?: () => void) => {
        updateAuditLogMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("auditLog.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createAuditLogMutation,
        updateMutation: updateAuditLogMutation,
        deleteMutation: deleteAuditLogMutation,
        bulkDeleteMutation,
        createAuditLogWithValidation,
        updateAuditLogWithValidation,
        deleteAuditLog: (id: string) => deleteAuditLogMutation.mutate({ path: { id } }),
        isMutating: createAuditLogMutation.isPending || updateAuditLogMutation.isPending || deleteAuditLogMutation.isPending || bulkDeleteMutation.isPending
    }
}
