import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiBlocklistMutation,
    putApiBlocklistMutation,
    deleteApiBlocklistByIdMutation,
    getApiBlocklistByIdQueryKey,
    getApiBlocklistDetailByIdQueryKey,
    getApiBlocklistDropdownQueryKey,
    postApiBlocklistSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateBlocklistRequest, UpdateBlocklistRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useBlocklistMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiBlocklistDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiBlocklistSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["blocklist", "search"] })
    }

    const createBlocklistMutation = useMutation({
        ...postApiBlocklistMutation(),
        onSuccess: () => {
            toast.success(t("blocklist.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateBlocklistMutation = useMutation({
        ...putApiBlocklistMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("blocklist.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiBlocklistByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiBlocklistDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteBlocklistMutation = useMutation({
        ...deleteApiBlocklistByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("blocklist.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiBlocklistByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiBlocklistDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("blocklist.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiBlocklistByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("blocklist.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("blocklist.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("blocklist.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("blocklist.bulk.deleteError"))
    })

    const createBlocklistWithValidation = (data: CreateBlocklistRequest, setError: UseFormSetError<CreateBlocklistRequest>, onSuccess?: () => void) => {
        createBlocklistMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("blocklist.messages.create.error")
                }),
            },
        )
    }

    const updateBlocklistWithValidation = (data: UpdateBlocklistRequest, setError: UseFormSetError<UpdateBlocklistRequest>, onSuccess?: () => void) => {
        updateBlocklistMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("blocklist.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createBlocklistMutation,
        updateMutation: updateBlocklistMutation,
        deleteMutation: deleteBlocklistMutation,
        bulkDeleteMutation,
        createBlocklistWithValidation,
        updateBlocklistWithValidation,
        deleteBlocklist: (id: string) => deleteBlocklistMutation.mutate({ path: { id } }),
        isMutating: createBlocklistMutation.isPending || updateBlocklistMutation.isPending || deleteBlocklistMutation.isPending || bulkDeleteMutation.isPending
    }
}
