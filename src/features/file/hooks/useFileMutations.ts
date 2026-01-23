import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiFileMutation,
    putApiFileMutation,
    deleteApiFileByIdMutation,
    getApiFileByIdQueryKey,
    getApiFileDetailByIdQueryKey,
    getApiFileDropdownQueryKey,
    postApiFileSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateFileRequest, UpdateFileRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useFileMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiFileDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiFileSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["file", "search"] })
    }

    const createFileMutation = useMutation({
        ...postApiFileMutation(),
        onSuccess: () => {
            toast.success(t("file.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateFileMutation = useMutation({
        ...putApiFileMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("file.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiFileByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiFileDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteFileMutation = useMutation({
        ...deleteApiFileByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("file.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiFileByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiFileDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("file.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiFileByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("file.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("file.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("file.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("file.bulk.deleteError"))
    })

    const createFileWithValidation = (data: CreateFileRequest, setError: UseFormSetError<CreateFileRequest>, onSuccess?: () => void) => {
        createFileMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("file.messages.create.error")
                }),
            },
        )
    }

    const updateFileWithValidation = (data: UpdateFileRequest, setError: UseFormSetError<UpdateFileRequest>, onSuccess?: () => void) => {
        updateFileMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("file.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createFileMutation,
        updateMutation: updateFileMutation,
        deleteMutation: deleteFileMutation,
        bulkDeleteMutation,
        createFileWithValidation,
        updateFileWithValidation,
        deleteFile: (id: string) => deleteFileMutation.mutate({ path: { id } }),
        isMutating: createFileMutation.isPending || updateFileMutation.isPending || deleteFileMutation.isPending || bulkDeleteMutation.isPending
    }
}
