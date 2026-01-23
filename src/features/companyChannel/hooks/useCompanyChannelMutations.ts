import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCompanyChannelMutation,
    putApiCompanyChannelMutation,
    deleteApiCompanyChannelByIdMutation,
    getApiCompanyChannelByIdQueryKey,
    getApiCompanyChannelDetailByIdQueryKey,
    getApiCompanyChannelDropdownQueryKey,
    postApiCompanyChannelSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCompanyChannelRequest, UpdateCompanyChannelRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCompanyChannelMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCompanyChannelDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCompanyChannelSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["companyChannel", "search"] })
    }

    const createCompanyChannelMutation = useMutation({
        ...postApiCompanyChannelMutation(),
        onSuccess: () => {
            toast.success(t("companyChannel.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCompanyChannelMutation = useMutation({
        ...putApiCompanyChannelMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("companyChannel.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCompanyChannelByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCompanyChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCompanyChannelMutation = useMutation({
        ...deleteApiCompanyChannelByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("companyChannel.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCompanyChannelByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCompanyChannelDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("companyChannel.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCompanyChannelByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("companyChannel.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("companyChannel.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("companyChannel.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("companyChannel.bulk.deleteError"))
    })

    const createCompanyChannelWithValidation = (data: CreateCompanyChannelRequest, setError: UseFormSetError<CreateCompanyChannelRequest>, onSuccess?: () => void) => {
        createCompanyChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companyChannel.messages.create.error")
                }),
            },
        )
    }

    const updateCompanyChannelWithValidation = (data: UpdateCompanyChannelRequest, setError: UseFormSetError<UpdateCompanyChannelRequest>, onSuccess?: () => void) => {
        updateCompanyChannelMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companyChannel.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCompanyChannelMutation,
        updateMutation: updateCompanyChannelMutation,
        deleteMutation: deleteCompanyChannelMutation,
        bulkDeleteMutation,
        createCompanyChannelWithValidation,
        updateCompanyChannelWithValidation,
        deleteCompanyChannel: (id: string) => deleteCompanyChannelMutation.mutate({ path: { id } }),
        isMutating: createCompanyChannelMutation.isPending || updateCompanyChannelMutation.isPending || deleteCompanyChannelMutation.isPending || bulkDeleteMutation.isPending
    }
}
