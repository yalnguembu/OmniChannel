import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCompanyMutation,
    putApiCompanyMutation,
    deleteApiCompanyByIdMutation,
    getApiCompanyByIdQueryKey,
    getApiCompanyDetailByIdQueryKey,
    getApiCompanyDropdownQueryKey,
    postApiCompanySearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCompanyRequest, UpdateCompanyRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCompanyMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCompanyDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["company", "search"] })
    }

    const createCompanyMutation = useMutation({
        ...postApiCompanyMutation(),
        onSuccess: () => {
            toast.success(t("company.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCompanyMutation = useMutation({
        ...putApiCompanyMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("company.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCompanyByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCompanyDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCompanyMutation = useMutation({
        ...deleteApiCompanyByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("company.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCompanyByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCompanyDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("company.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCompanyByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("company.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("company.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("company.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("company.bulk.deleteError"))
    })

    const createCompanyWithValidation = (data: CreateCompanyRequest, setError: UseFormSetError<CreateCompanyRequest>, onSuccess?: () => void) => {
        createCompanyMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("company.messages.create.error")
                }),
            },
        )
    }

    const updateCompanyWithValidation = (data: UpdateCompanyRequest, setError: UseFormSetError<UpdateCompanyRequest>, onSuccess?: () => void) => {
        updateCompanyMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("company.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCompanyMutation,
        updateMutation: updateCompanyMutation,
        deleteMutation: deleteCompanyMutation,
        bulkDeleteMutation,
        createCompanyWithValidation,
        updateCompanyWithValidation,
        deleteCompany: (id: string) => deleteCompanyMutation.mutate({ path: { id } }),
        isMutating: createCompanyMutation.isPending || updateCompanyMutation.isPending || deleteCompanyMutation.isPending || bulkDeleteMutation.isPending
    }
}
