import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCompanyVerificationMutation,
    putApiCompanyVerificationMutation,
    deleteApiCompanyVerificationByIdMutation,
    getApiCompanyVerificationByIdQueryKey,
    getApiCompanyVerificationDetailByIdQueryKey,
    getApiCompanyVerificationDropdownQueryKey,
    postApiCompanyVerificationSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCompanyVerificationRequest, UpdateCompanyVerificationRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCompanyVerificationMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCompanyVerificationDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCompanyVerificationSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["companyVerification", "search"] })
    }

    const createCompanyVerificationMutation = useMutation({
        ...postApiCompanyVerificationMutation(),
        onSuccess: () => {
            toast.success(t("companyVerification.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCompanyVerificationMutation = useMutation({
        ...putApiCompanyVerificationMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("companyVerification.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCompanyVerificationByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCompanyVerificationDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCompanyVerificationMutation = useMutation({
        ...deleteApiCompanyVerificationByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("companyVerification.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCompanyVerificationByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCompanyVerificationDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("companyVerification.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCompanyVerificationByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("companyVerification.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("companyVerification.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("companyVerification.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("companyVerification.bulk.deleteError"))
    })

    const createCompanyVerificationWithValidation = (data: CreateCompanyVerificationRequest, setError: UseFormSetError<CreateCompanyVerificationRequest>, onSuccess?: () => void) => {
        createCompanyVerificationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companyVerification.messages.create.error")
                }),
            },
        )
    }

    const updateCompanyVerificationWithValidation = (data: UpdateCompanyVerificationRequest, setError: UseFormSetError<UpdateCompanyVerificationRequest>, onSuccess?: () => void) => {
        updateCompanyVerificationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("companyVerification.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCompanyVerificationMutation,
        updateMutation: updateCompanyVerificationMutation,
        deleteMutation: deleteCompanyVerificationMutation,
        bulkDeleteMutation,
        createCompanyVerificationWithValidation,
        updateCompanyVerificationWithValidation,
        deleteCompanyVerification: (id: string) => deleteCompanyVerificationMutation.mutate({ path: { id } }),
        isMutating: createCompanyVerificationMutation.isPending || updateCompanyVerificationMutation.isPending || deleteCompanyVerificationMutation.isPending || bulkDeleteMutation.isPending
    }
}
