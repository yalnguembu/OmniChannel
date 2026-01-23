import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiClientImportMutation,
    putApiClientImportMutation,
    deleteApiClientImportByIdMutation,
    getApiClientImportByIdQueryKey,
    getApiClientImportDetailByIdQueryKey,
    getApiClientImportDropdownQueryKey,
    postApiClientImportSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateClientImportRequest, UpdateClientImportRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useClientImportMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiClientImportDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiClientImportSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["clientImport", "search"] })
    }

    const createClientImportMutation = useMutation({
        ...postApiClientImportMutation(),
        onSuccess: () => {
            toast.success(t("clientImport.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateClientImportMutation = useMutation({
        ...putApiClientImportMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("clientImport.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiClientImportByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiClientImportDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteClientImportMutation = useMutation({
        ...deleteApiClientImportByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("clientImport.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiClientImportByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiClientImportDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("clientImport.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiClientImportByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("clientImport.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("clientImport.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("clientImport.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("clientImport.bulk.deleteError"))
    })

    const createClientImportWithValidation = (data: CreateClientImportRequest, setError: UseFormSetError<CreateClientImportRequest>, onSuccess?: () => void) => {
        createClientImportMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientImport.messages.create.error")
                }),
            },
        )
    }

    const updateClientImportWithValidation = (data: UpdateClientImportRequest, setError: UseFormSetError<UpdateClientImportRequest>, onSuccess?: () => void) => {
        updateClientImportMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientImport.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createClientImportMutation,
        updateMutation: updateClientImportMutation,
        deleteMutation: deleteClientImportMutation,
        bulkDeleteMutation,
        createClientImportWithValidation,
        updateClientImportWithValidation,
        deleteClientImport: (id: string) => deleteClientImportMutation.mutate({ path: { id } }),
        isMutating: createClientImportMutation.isPending || updateClientImportMutation.isPending || deleteClientImportMutation.isPending || bulkDeleteMutation.isPending
    }
}
