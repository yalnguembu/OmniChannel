import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiSysLogMutation,
    putApiSysLogMutation,
    deleteApiSysLogByIdMutation,
    getApiSysLogByIdQueryKey,
    getApiSysLogDetailByIdQueryKey,
    getApiSysLogDropdownQueryKey,
    postApiSysLogSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateSysLogRequest, UpdateSysLogRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useSysLogMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiSysLogDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiSysLogSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["sysLog", "search"] })
    }

    const createSysLogMutation = useMutation({
        ...postApiSysLogMutation(),
        onSuccess: () => {
            toast.success(t("sysLog.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateSysLogMutation = useMutation({
        ...putApiSysLogMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("sysLog.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiSysLogByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiSysLogDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteSysLogMutation = useMutation({
        ...deleteApiSysLogByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("sysLog.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiSysLogByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiSysLogDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("sysLog.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiSysLogByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("sysLog.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("sysLog.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("sysLog.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("sysLog.bulk.deleteError"))
    })

    const createSysLogWithValidation = (data: CreateSysLogRequest, setError: UseFormSetError<CreateSysLogRequest>, onSuccess?: () => void) => {
        createSysLogMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("sysLog.messages.create.error")
                }),
            },
        )
    }

    const updateSysLogWithValidation = (data: UpdateSysLogRequest, setError: UseFormSetError<UpdateSysLogRequest>, onSuccess?: () => void) => {
        updateSysLogMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("sysLog.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createSysLogMutation,
        updateMutation: updateSysLogMutation,
        deleteMutation: deleteSysLogMutation,
        bulkDeleteMutation,
        createSysLogWithValidation,
        updateSysLogWithValidation,
        deleteSysLog: (id: string) => deleteSysLogMutation.mutate({ path: { id } }),
        isMutating: createSysLogMutation.isPending || updateSysLogMutation.isPending || deleteSysLogMutation.isPending || bulkDeleteMutation.isPending
    }
}
