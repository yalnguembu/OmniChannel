import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiClientSegmentMutation,
    putApiClientSegmentMutation,
    deleteApiClientSegmentByIdMutation,
    getApiClientSegmentByIdQueryKey,
    getApiClientSegmentDetailByIdQueryKey,
    getApiClientSegmentDropdownQueryKey,
    postApiClientSegmentSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateClientSegmentRequest, UpdateClientSegmentRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useClientSegmentMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiClientSegmentDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiClientSegmentSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["clientSegment", "search"] })
    }

    const createClientSegmentMutation = useMutation({
        ...postApiClientSegmentMutation(),
        onSuccess: () => {
            toast.success(t("clientSegment.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateClientSegmentMutation = useMutation({
        ...putApiClientSegmentMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("clientSegment.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiClientSegmentByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiClientSegmentDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteClientSegmentMutation = useMutation({
        ...deleteApiClientSegmentByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("clientSegment.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiClientSegmentByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiClientSegmentDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("clientSegment.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiClientSegmentByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("clientSegment.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("clientSegment.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("clientSegment.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("clientSegment.bulk.deleteError"))
    })

    const createClientSegmentWithValidation = (data: CreateClientSegmentRequest, setError: UseFormSetError<CreateClientSegmentRequest>, onSuccess?: () => void) => {
        createClientSegmentMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientSegment.messages.create.error")
                }),
            },
        )
    }

    const updateClientSegmentWithValidation = (data: UpdateClientSegmentRequest, setError: UseFormSetError<UpdateClientSegmentRequest>, onSuccess?: () => void) => {
        updateClientSegmentMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientSegment.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createClientSegmentMutation,
        updateMutation: updateClientSegmentMutation,
        deleteMutation: deleteClientSegmentMutation,
        bulkDeleteMutation,
        createClientSegmentWithValidation,
        updateClientSegmentWithValidation,
        deleteClientSegment: (id: string) => deleteClientSegmentMutation.mutate({ path: { id } }),
        isMutating: createClientSegmentMutation.isPending || updateClientSegmentMutation.isPending || deleteClientSegmentMutation.isPending || bulkDeleteMutation.isPending
    }
}
