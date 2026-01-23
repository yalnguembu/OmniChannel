import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiClientMutation,
    putApiClientMutation,
    deleteApiClientByIdMutation,
    getApiClientByIdQueryKey,
    getApiClientDetailByIdQueryKey,
    getApiClientDropdownQueryKey,
    postApiClientSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateClientRequest, UpdateClientRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useClientMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiClientDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiClientSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["client", "search"] })
    }

    const createClientMutation = useMutation({
        ...postApiClientMutation(),
        onSuccess: () => {
            toast.success(t("client.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateClientMutation = useMutation({
        ...putApiClientMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("client.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiClientByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiClientDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteClientMutation = useMutation({
        ...deleteApiClientByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("client.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiClientByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiClientDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("client.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiClientByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("client.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("client.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("client.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("client.bulk.deleteError"))
    })

    const createClientWithValidation = (data: CreateClientRequest, setError: UseFormSetError<CreateClientRequest>, onSuccess?: () => void) => {
        createClientMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("client.messages.create.error")
                }),
            },
        )
    }

    const updateClientWithValidation = (data: UpdateClientRequest, setError: UseFormSetError<UpdateClientRequest>, onSuccess?: () => void) => {
        updateClientMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("client.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createClientMutation,
        updateMutation: updateClientMutation,
        deleteMutation: deleteClientMutation,
        bulkDeleteMutation,
        createClientWithValidation,
        updateClientWithValidation,
        deleteClient: (id: string) => deleteClientMutation.mutate({ path: { id } }),
        isMutating: createClientMutation.isPending || updateClientMutation.isPending || deleteClientMutation.isPending || bulkDeleteMutation.isPending
    }
}
