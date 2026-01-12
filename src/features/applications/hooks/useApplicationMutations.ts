import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiApplicationMutation,
    putApiApplicationMutation,
    deleteApiApplicationByIdMutation,
    patchApiApplicationRenegereApiSecretByIdMutation,
    getApiApplicationByIdQueryKey,
    getApiApplicationDetailByIdQueryKey,
    getApiApplicationDropdownQueryKey,
    postApiApplicationSearchQueryKey,
    getApiApplicationGetApiKeyByIdQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateApplicationRequest, UpdateApplicationRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useApplicationMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { mapValidationErrorsToForm } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiApplicationDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiApplicationSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["application", "search"] })
    }

    const createApplicationMutation = useMutation({
        ...postApiApplicationMutation(),
        onSuccess: () => {
            toast.success(t("applications.messages.create.success"))
            invalidateCommonQueries()
        },
    })

    const updateApplicationMutation = useMutation({
        ...putApiApplicationMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("applications.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiApplicationByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiApplicationDetailByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiApplicationGetApiKeyByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteApplicationMutation = useMutation({
        ...deleteApiApplicationByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("applications.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiApplicationByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiApplicationDetailByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiApplicationGetApiKeyByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("applications.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiApplicationByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("applications.bulk.deleteReason") },
                    })
                )
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("applications.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("applications.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () => toast.error(t("applications.bulk.deleteError")),
    })

    const regenerateApiSecretMutation = useMutation({
        ...patchApiApplicationRenegereApiSecretByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("applications.messages.regenerateSecret.success"))

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.invalidateQueries({ queryKey: getApiApplicationGetApiKeyByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiApplicationDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () => toast.error(t("applications.messages.regenerateSecret.error")),
    })

    // Helpers with validation
    const createApplicationWithValidation = (
        data: CreateApplicationRequest,
        setError: UseFormSetError<CreateApplicationRequest>,
        onSuccess?: () => void
    ) => {
        createApplicationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: (error: any) => {
                    const mapped = mapValidationErrorsToForm(error, setError)
                    if (!mapped) {
                        toast.error(error.message || t("applications.messages.create.error"))
                    }
                },
            }
        )
    }

    const updateApplicationWithValidation = (
        data: UpdateApplicationRequest,
        setError: UseFormSetError<UpdateApplicationRequest>,
        onSuccess?: () => void
    ) => {
        updateApplicationMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: (error: any) => {
                    const mapped = mapValidationErrorsToForm(error, setError)
                    if (!mapped) {
                        toast.error(error.message || t("applications.messages.update.error"))
                    }
                },
            }
        )
    }

    return {
        createMutation: createApplicationMutation,
        updateMutation: updateApplicationMutation,
        deleteMutation: deleteApplicationMutation,
        bulkDeleteMutation,
        regenerateApiSecretMutation,
        createApplicationWithValidation,
        updateApplicationWithValidation,
        deleteApplication: (id: string) => deleteApplicationMutation.mutate({ path: { id } }),
        regenerateApiSecret: (id: string) => regenerateApiSecretMutation.mutate({ path: { id } }),
        isMutating:
            createApplicationMutation.isPending ||
            updateApplicationMutation.isPending ||
            deleteApplicationMutation.isPending ||
            bulkDeleteMutation.isPending ||
            regenerateApiSecretMutation.isPending,
    }
}
