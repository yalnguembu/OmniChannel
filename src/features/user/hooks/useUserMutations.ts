import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiUserMutation,
    putApiUserMutation,
    deleteApiUserByIdMutation,
    getApiUserByIdQueryKey,
    getApiUserDetailByIdQueryKey,
    getApiUserDropdownQueryKey,
    postApiUserSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateUserRequest, UpdateUserRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useUserMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiUserDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiUserSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["user", "search"] })
    }

    const createUserMutation = useMutation({
        ...postApiUserMutation(),
        onSuccess: () => {
            toast.success(t("user.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateUserMutation = useMutation({
        ...putApiUserMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("user.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiUserByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiUserDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteUserMutation = useMutation({
        ...deleteApiUserByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("user.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiUserByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiUserDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("user.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiUserByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("user.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("user.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("user.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("user.bulk.deleteError"))
    })

    const createUserWithValidation = (data: CreateUserRequest, setError: UseFormSetError<CreateUserRequest>, onSuccess?: () => void) => {
        createUserMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("user.messages.create.error")
                }),
            },
        )
    }

    const updateUserWithValidation = (data: UpdateUserRequest, setError: UseFormSetError<UpdateUserRequest>, onSuccess?: () => void) => {
        updateUserMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("user.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createUserMutation,
        updateMutation: updateUserMutation,
        deleteMutation: deleteUserMutation,
        bulkDeleteMutation,
        createUserWithValidation,
        updateUserWithValidation,
        deleteUser: (id: string) => deleteUserMutation.mutate({ path: { id } }),
        isMutating: createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending || bulkDeleteMutation.isPending
    }
}
