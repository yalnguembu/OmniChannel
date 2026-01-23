import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiTagMutation,
    putApiTagMutation,
    deleteApiTagByIdMutation,
    getApiTagByIdQueryKey,
    getApiTagDetailByIdQueryKey,
    getApiTagDropdownQueryKey,
    postApiTagSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateTagRequest, UpdateTagRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useTagMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiTagDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiTagSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["tag", "search"] })
    }

    const createTagMutation = useMutation({
        ...postApiTagMutation(),
        onSuccess: () => {
            toast.success(t("tag.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateTagMutation = useMutation({
        ...putApiTagMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("tag.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiTagByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiTagDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteTagMutation = useMutation({
        ...deleteApiTagByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("tag.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiTagByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiTagDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("tag.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiTagByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("tag.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("tag.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("tag.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("tag.bulk.deleteError"))
    })

    const createTagWithValidation = (data: CreateTagRequest, setError: UseFormSetError<CreateTagRequest>, onSuccess?: () => void) => {
        createTagMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("tag.messages.create.error")
                }),
            },
        )
    }

    const updateTagWithValidation = (data: UpdateTagRequest, setError: UseFormSetError<UpdateTagRequest>, onSuccess?: () => void) => {
        updateTagMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("tag.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createTagMutation,
        updateMutation: updateTagMutation,
        deleteMutation: deleteTagMutation,
        bulkDeleteMutation,
        createTagWithValidation,
        updateTagWithValidation,
        deleteTag: (id: string) => deleteTagMutation.mutate({ path: { id } }),
        isMutating: createTagMutation.isPending || updateTagMutation.isPending || deleteTagMutation.isPending || bulkDeleteMutation.isPending
    }
}
