import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiUserProfileMutation,
    putApiUserProfileMutation,
    deleteApiUserProfileByIdMutation,
    getApiUserProfileByIdQueryKey,
    getApiUserProfileDetailByIdQueryKey,
    getApiUserProfileDropdownQueryKey,
    postApiUserProfileSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateUserProfileRequest, UpdateUserProfileRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useUserProfileMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiUserProfileDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiUserProfileSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["userProfile", "search"] })
    }

    const createUserProfileMutation = useMutation({
        ...postApiUserProfileMutation(),
        onSuccess: () => {
            toast.success(t("userProfile.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateUserProfileMutation = useMutation({
        ...putApiUserProfileMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("userProfile.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiUserProfileByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiUserProfileDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteUserProfileMutation = useMutation({
        ...deleteApiUserProfileByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("userProfile.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiUserProfileByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiUserProfileDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("userProfile.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiUserProfileByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("userProfile.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("userProfile.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("userProfile.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("userProfile.bulk.deleteError"))
    })

    const createUserProfileWithValidation = (data: CreateUserProfileRequest, setError: UseFormSetError<CreateUserProfileRequest>, onSuccess?: () => void) => {
        createUserProfileMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("userProfile.messages.create.error")
                }),
            },
        )
    }

    const updateUserProfileWithValidation = (data: UpdateUserProfileRequest, setError: UseFormSetError<UpdateUserProfileRequest>, onSuccess?: () => void) => {
        updateUserProfileMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("userProfile.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createUserProfileMutation,
        updateMutation: updateUserProfileMutation,
        deleteMutation: deleteUserProfileMutation,
        bulkDeleteMutation,
        createUserProfileWithValidation,
        updateUserProfileWithValidation,
        deleteUserProfile: (id: string) => deleteUserProfileMutation.mutate({ path: { id } }),
        isMutating: createUserProfileMutation.isPending || updateUserProfileMutation.isPending || deleteUserProfileMutation.isPending || bulkDeleteMutation.isPending
    }
}
