import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiClientSegmentMemberMutation,
    putApiClientSegmentMemberMutation,
    deleteApiClientSegmentMemberByIdMutation,
    getApiClientSegmentMemberByIdQueryKey,
    getApiClientSegmentMemberDetailByIdQueryKey,
    getApiClientSegmentMemberDropdownQueryKey,
    postApiClientSegmentMemberSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateClientSegmentMemberRequest, UpdateClientSegmentMemberRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useClientSegmentMemberMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiClientSegmentMemberDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiClientSegmentMemberSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["clientSegmentMember", "search"] })
    }

    const createClientSegmentMemberMutation = useMutation({
        ...postApiClientSegmentMemberMutation(),
        onSuccess: () => {
            toast.success(t("clientSegmentMember.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateClientSegmentMemberMutation = useMutation({
        ...putApiClientSegmentMemberMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("clientSegmentMember.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiClientSegmentMemberByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiClientSegmentMemberDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteClientSegmentMemberMutation = useMutation({
        ...deleteApiClientSegmentMemberByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("clientSegmentMember.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiClientSegmentMemberByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiClientSegmentMemberDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("clientSegmentMember.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiClientSegmentMemberByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("clientSegmentMember.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("clientSegmentMember.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("clientSegmentMember.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("clientSegmentMember.bulk.deleteError"))
    })

    const createClientSegmentMemberWithValidation = (data: CreateClientSegmentMemberRequest, setError: UseFormSetError<CreateClientSegmentMemberRequest>, onSuccess?: () => void) => {
        createClientSegmentMemberMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientSegmentMember.messages.create.error")
                }),
            },
        )
    }

    const updateClientSegmentMemberWithValidation = (data: UpdateClientSegmentMemberRequest, setError: UseFormSetError<UpdateClientSegmentMemberRequest>, onSuccess?: () => void) => {
        updateClientSegmentMemberMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("clientSegmentMember.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createClientSegmentMemberMutation,
        updateMutation: updateClientSegmentMemberMutation,
        deleteMutation: deleteClientSegmentMemberMutation,
        bulkDeleteMutation,
        createClientSegmentMemberWithValidation,
        updateClientSegmentMemberWithValidation,
        deleteClientSegmentMember: (id: string) => deleteClientSegmentMemberMutation.mutate({ path: { id } }),
        isMutating: createClientSegmentMemberMutation.isPending || updateClientSegmentMemberMutation.isPending || deleteClientSegmentMemberMutation.isPending || bulkDeleteMutation.isPending
    }
}
