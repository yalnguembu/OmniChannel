import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiChannelMutation,
    putApiChannelMutation,
    deleteApiChannelByIdMutation,
    getApiChannelByIdQueryKey,
    getApiChannelDetailByIdQueryKey,
    getApiChannelDropdownQueryKey,
    postApiChannelSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateChannelRequest, UpdateChannelRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useChannelMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiChannelDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiChannelSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["channel", "search"] })
    }

    const createChannelMutation = useMutation({
        ...postApiChannelMutation(),
        onSuccess: () => {
            toast.success(t("channel.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateChannelMutation = useMutation({
        ...putApiChannelMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("channel.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiChannelByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteChannelMutation = useMutation({
        ...deleteApiChannelByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("channel.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiChannelByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("channel.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiChannelByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("channel.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("channel.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("channel.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("channel.bulk.deleteError"))
    })

    const createChannelWithValidation = (data: CreateChannelRequest, setError: UseFormSetError<CreateChannelRequest>, onSuccess?: () => void) => {
        createChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("channel.messages.create.error")
                }),
            },
        )
    }

    const updateChannelWithValidation = (data: UpdateChannelRequest, setError: UseFormSetError<UpdateChannelRequest>, onSuccess?: () => void) => {
        updateChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("channel.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createChannelMutation,
        updateMutation: updateChannelMutation,
        deleteMutation: deleteChannelMutation,
        bulkDeleteMutation,
        createChannelWithValidation,
        updateChannelWithValidation,
        deleteChannel: (id: string) => deleteChannelMutation.mutate({ path: { id } }),
        isMutating: createChannelMutation.isPending || updateChannelMutation.isPending || deleteChannelMutation.isPending || bulkDeleteMutation.isPending
    }
}
