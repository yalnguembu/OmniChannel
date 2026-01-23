import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiJobMutation,
    putApiJobMutation,
    deleteApiJobByIdMutation,
    getApiJobByIdQueryKey,
    getApiJobDetailByIdQueryKey,
    getApiJobDropdownQueryKey,
    postApiJobSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateJobRequest, UpdateJobRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useJobMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiJobDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiJobSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["job", "search"] })
    }

    const createJobMutation = useMutation({
        ...postApiJobMutation(),
        onSuccess: () => {
            toast.success(t("job.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateJobMutation = useMutation({
        ...putApiJobMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("job.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiJobByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiJobDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteJobMutation = useMutation({
        ...deleteApiJobByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("job.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiJobByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiJobDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("job.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiJobByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("job.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("job.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("job.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("job.bulk.deleteError"))
    })

    const createJobWithValidation = (data: CreateJobRequest, setError: UseFormSetError<CreateJobRequest>, onSuccess?: () => void) => {
        createJobMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("job.messages.create.error")
                }),
            },
        )
    }

    const updateJobWithValidation = (data: UpdateJobRequest, setError: UseFormSetError<UpdateJobRequest>, onSuccess?: () => void) => {
        updateJobMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("job.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createJobMutation,
        updateMutation: updateJobMutation,
        deleteMutation: deleteJobMutation,
        bulkDeleteMutation,
        createJobWithValidation,
        updateJobWithValidation,
        deleteJob: (id: string) => deleteJobMutation.mutate({ path: { id } }),
        isMutating: createJobMutation.isPending || updateJobMutation.isPending || deleteJobMutation.isPending || bulkDeleteMutation.isPending
    }
}
