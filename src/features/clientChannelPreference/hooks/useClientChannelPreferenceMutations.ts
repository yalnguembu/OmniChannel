import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiClientChannelPreferenceMutation,
    putApiClientChannelPreferenceMutation,
    deleteApiClientChannelPreferenceByIdMutation,
    getApiClientChannelPreferenceByIdQueryKey,
    getApiClientChannelPreferenceDetailByIdQueryKey,
    getApiClientChannelPreferenceDropdownQueryKey,
    postApiClientChannelPreferenceSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateClientChannelPreferenceRequest, UpdateClientChannelPreferenceRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useClientChannelPreferenceMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiClientChannelPreferenceDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiClientChannelPreferenceSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["clientChannelPreference", "search"] })
    }

    const createClientChannelPreferenceMutation = useMutation({
        ...postApiClientChannelPreferenceMutation(),
        onSuccess: () => {
            toast.success(t("clientChannelPreference.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateClientChannelPreferenceMutation = useMutation({
        ...putApiClientChannelPreferenceMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("clientChannelPreference.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiClientChannelPreferenceByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiClientChannelPreferenceDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteClientChannelPreferenceMutation = useMutation({
        ...deleteApiClientChannelPreferenceByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("clientChannelPreference.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiClientChannelPreferenceByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiClientChannelPreferenceDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("clientChannelPreference.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiClientChannelPreferenceByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("clientChannelPreference.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("clientChannelPreference.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("clientChannelPreference.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("clientChannelPreference.bulk.deleteError"))
    })

    const createClientChannelPreferenceWithValidation = (data: CreateClientChannelPreferenceRequest, setError: UseFormSetError<CreateClientChannelPreferenceRequest>, onSuccess?: () => void) => {
        createClientChannelPreferenceMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientChannelPreference.messages.create.error")
                }),
            },
        )
    }

    const updateClientChannelPreferenceWithValidation = (data: UpdateClientChannelPreferenceRequest, setError: UseFormSetError<UpdateClientChannelPreferenceRequest>, onSuccess?: () => void) => {
        updateClientChannelPreferenceMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientChannelPreference.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createClientChannelPreferenceMutation,
        updateMutation: updateClientChannelPreferenceMutation,
        deleteMutation: deleteClientChannelPreferenceMutation,
        bulkDeleteMutation,
        createClientChannelPreferenceWithValidation,
        updateClientChannelPreferenceWithValidation,
        deleteClientChannelPreference: (id: string) => deleteClientChannelPreferenceMutation.mutate({ path: { id } }),
        isMutating: createClientChannelPreferenceMutation.isPending || updateClientChannelPreferenceMutation.isPending || deleteClientChannelPreferenceMutation.isPending || bulkDeleteMutation.isPending
    }
}
