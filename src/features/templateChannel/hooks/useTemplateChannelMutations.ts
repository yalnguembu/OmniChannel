import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiTemplateChannelMutation,
    putApiTemplateChannelMutation,
    deleteApiTemplateChannelByIdMutation,
    getApiTemplateChannelByIdQueryKey,
    getApiTemplateChannelDetailByIdQueryKey,
    getApiTemplateChannelDropdownQueryKey,
    postApiTemplateChannelSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateTemplateChannelRequest, UpdateTemplateChannelRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useTemplateChannelMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiTemplateChannelDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiTemplateChannelSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["templateChannel", "search"] })
    }

    const createTemplateChannelMutation = useMutation({
        ...postApiTemplateChannelMutation(),
        onSuccess: () => {
            toast.success(t("templateChannel.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateTemplateChannelMutation = useMutation({
        ...putApiTemplateChannelMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("templateChannel.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiTemplateChannelByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiTemplateChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteTemplateChannelMutation = useMutation({
        ...deleteApiTemplateChannelByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("templateChannel.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiTemplateChannelByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiTemplateChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("templateChannel.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiTemplateChannelByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("templateChannel.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("templateChannel.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("templateChannel.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("templateChannel.bulk.deleteError"))
    })

    const createTemplateChannelWithValidation = (data: CreateTemplateChannelRequest, setError: UseFormSetError<CreateTemplateChannelRequest>, onSuccess?: () => void) => {
        createTemplateChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("templateChannel.messages.create.error")
                }),
            },
        )
    }

    const updateTemplateChannelWithValidation = (data: UpdateTemplateChannelRequest, setError: UseFormSetError<UpdateTemplateChannelRequest>, onSuccess?: () => void) => {
        updateTemplateChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("templateChannel.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createTemplateChannelMutation,
        updateMutation: updateTemplateChannelMutation,
        deleteMutation: deleteTemplateChannelMutation,
        bulkDeleteMutation,
        createTemplateChannelWithValidation,
        updateTemplateChannelWithValidation,
        deleteTemplateChannel: (id: string) => deleteTemplateChannelMutation.mutate({ path: { id } }),
        isMutating: createTemplateChannelMutation.isPending || updateTemplateChannelMutation.isPending || deleteTemplateChannelMutation.isPending || bulkDeleteMutation.isPending
    }
}
