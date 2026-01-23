import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiConnectorMutation,
    putApiConnectorMutation,
    deleteApiConnectorByIdMutation,
    getApiConnectorByIdQueryKey,
    getApiConnectorDetailByIdQueryKey,
    getApiConnectorDropdownQueryKey,
    postApiConnectorSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateConnectorRequest, UpdateConnectorRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useConnectorMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiConnectorDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiConnectorSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["connector", "search"] })
    }

    const createConnectorMutation = useMutation({
        ...postApiConnectorMutation(),
        onSuccess: () => {
            toast.success(t("connector.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateConnectorMutation = useMutation({
        ...putApiConnectorMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("connector.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiConnectorByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiConnectorDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteConnectorMutation = useMutation({
        ...deleteApiConnectorByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("connector.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiConnectorByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiConnectorDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("connector.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiConnectorByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("connector.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("connector.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("connector.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("connector.bulk.deleteError"))
    })

    const createConnectorWithValidation = (data: CreateConnectorRequest, setError: UseFormSetError<CreateConnectorRequest>, onSuccess?: () => void) => {
        createConnectorMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("connector.messages.create.error")
                }),
            },
        )
    }

    const updateConnectorWithValidation = (data: UpdateConnectorRequest, setError: UseFormSetError<UpdateConnectorRequest>, onSuccess?: () => void) => {
        updateConnectorMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("connector.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createConnectorMutation,
        updateMutation: updateConnectorMutation,
        deleteMutation: deleteConnectorMutation,
        bulkDeleteMutation,
        createConnectorWithValidation,
        updateConnectorWithValidation,
        deleteConnector: (id: string) => deleteConnectorMutation.mutate({ path: { id } }),
        isMutating: createConnectorMutation.isPending || updateConnectorMutation.isPending || deleteConnectorMutation.isPending || bulkDeleteMutation.isPending
    }
}
