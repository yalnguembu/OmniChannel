import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiEntityTagMutation,
    putApiEntityTagMutation,
    deleteApiEntityTagByIdMutation,
    getApiEntityTagByIdQueryKey,
    getApiEntityTagDetailByIdQueryKey,
    getApiEntityTagDropdownQueryKey,
    postApiEntityTagSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateEntityTagRequest, UpdateEntityTagRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useEntityTagMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiEntityTagDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiEntityTagSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["entityTag", "search"] })
    }

    const createEntityTagMutation = useMutation({
        ...postApiEntityTagMutation(),
        onSuccess: () => {
            toast.success(t("entityTag.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateEntityTagMutation = useMutation({
        ...putApiEntityTagMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("entityTag.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiEntityTagByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiEntityTagDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteEntityTagMutation = useMutation({
        ...deleteApiEntityTagByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("entityTag.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiEntityTagByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiEntityTagDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("entityTag.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiEntityTagByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("entityTag.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("entityTag.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("entityTag.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("entityTag.bulk.deleteError"))
    })

    const createEntityTagWithValidation = (data: CreateEntityTagRequest, setError: UseFormSetError<CreateEntityTagRequest>, onSuccess?: () => void) => {
        createEntityTagMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("entityTag.messages.create.error")
                }),
            },
        )
    }

    const updateEntityTagWithValidation = (data: UpdateEntityTagRequest, setError: UseFormSetError<UpdateEntityTagRequest>, onSuccess?: () => void) => {
        updateEntityTagMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("entityTag.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createEntityTagMutation,
        updateMutation: updateEntityTagMutation,
        deleteMutation: deleteEntityTagMutation,
        bulkDeleteMutation,
        createEntityTagWithValidation,
        updateEntityTagWithValidation,
        deleteEntityTag: (id: string) => deleteEntityTagMutation.mutate({ path: { id } }),
        isMutating: createEntityTagMutation.isPending || updateEntityTagMutation.isPending || deleteEntityTagMutation.isPending || bulkDeleteMutation.isPending
    }
}
