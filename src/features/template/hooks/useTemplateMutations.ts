import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiTemplateMutation,
    putApiTemplateMutation,
    deleteApiTemplateByIdMutation,
    getApiTemplateByIdQueryKey,
    getApiTemplateDetailByIdQueryKey,
    getApiTemplateDropdownQueryKey,
    postApiTemplateSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateTemplateRequest, UpdateTemplateRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useTemplateMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiTemplateDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiTemplateSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["template", "search"] })
    }

    const createTemplateMutation = useMutation({
        ...postApiTemplateMutation(),
        onSuccess: () => {
            toast.success(t("template.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateTemplateMutation = useMutation({
        ...putApiTemplateMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("template.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiTemplateByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiTemplateDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteTemplateMutation = useMutation({
        ...deleteApiTemplateByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("template.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiTemplateByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiTemplateDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("template.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiTemplateByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("template.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("template.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("template.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("template.bulk.deleteError"))
    })

    const createTemplateWithValidation = (data: CreateTemplateRequest, setError: UseFormSetError<CreateTemplateRequest>, onSuccess?: () => void) => {
        createTemplateMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("template.messages.create.error")
                }),
            },
        )
    }

    const updateTemplateWithValidation = (data: UpdateTemplateRequest, setError: UseFormSetError<UpdateTemplateRequest>, onSuccess?: () => void) => {
        updateTemplateMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("template.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createTemplateMutation,
        updateMutation: updateTemplateMutation,
        deleteMutation: deleteTemplateMutation,
        bulkDeleteMutation,
        createTemplateWithValidation,
        updateTemplateWithValidation,
        deleteTemplate: (id: string) => deleteTemplateMutation.mutate({ path: { id } }),
        isMutating: createTemplateMutation.isPending || updateTemplateMutation.isPending || deleteTemplateMutation.isPending || bulkDeleteMutation.isPending
    }
}
