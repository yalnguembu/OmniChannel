import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCompanyApiKeyMutation,
    putApiCompanyApiKeyMutation,
    deleteApiCompanyApiKeyByIdMutation,
    getApiCompanyApiKeyByIdQueryKey,
    getApiCompanyApiKeyDetailByIdQueryKey,
    getApiCompanyApiKeyDropdownQueryKey,
    postApiCompanyApiKeySearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCompanyApiKeyRequest, UpdateCompanyApiKeyRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCompanyApiKeyMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCompanyApiKeyDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCompanyApiKeySearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["companyApiKey", "search"] })
    }

    const createCompanyApiKeyMutation = useMutation({
        ...postApiCompanyApiKeyMutation(),
        onSuccess: () => {
            toast.success(t("companyApiKey.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCompanyApiKeyMutation = useMutation({
        ...putApiCompanyApiKeyMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("companyApiKey.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCompanyApiKeyByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCompanyApiKeyDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCompanyApiKeyMutation = useMutation({
        ...deleteApiCompanyApiKeyByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("companyApiKey.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCompanyApiKeyByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCompanyApiKeyDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("companyApiKey.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCompanyApiKeyByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("companyApiKey.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("companyApiKey.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("companyApiKey.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("companyApiKey.bulk.deleteError"))
    })

    const createCompanyApiKeyWithValidation = (data: CreateCompanyApiKeyRequest, setError: UseFormSetError<CreateCompanyApiKeyRequest>, onSuccess?: () => void) => {
        createCompanyApiKeyMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companyApiKey.messages.create.error")
                }),
            },
        )
    }

    const updateCompanyApiKeyWithValidation = (data: UpdateCompanyApiKeyRequest, setError: UseFormSetError<UpdateCompanyApiKeyRequest>, onSuccess?: () => void) => {
        updateCompanyApiKeyMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companyApiKey.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCompanyApiKeyMutation,
        updateMutation: updateCompanyApiKeyMutation,
        deleteMutation: deleteCompanyApiKeyMutation,
        bulkDeleteMutation,
        createCompanyApiKeyWithValidation,
        updateCompanyApiKeyWithValidation,
        deleteCompanyApiKey: (id: string) => deleteCompanyApiKeyMutation.mutate({ path: { id } }),
        isMutating: createCompanyApiKeyMutation.isPending || updateCompanyApiKeyMutation.isPending || deleteCompanyApiKeyMutation.isPending || bulkDeleteMutation.isPending
    }
}
