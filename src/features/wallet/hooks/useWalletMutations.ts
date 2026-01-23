import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiWalletMutation,
    putApiWalletMutation,
    deleteApiWalletByIdMutation,
    getApiWalletByIdQueryKey,
    getApiWalletDetailByIdQueryKey,
    getApiWalletDropdownQueryKey,
    postApiWalletSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateWalletRequest, UpdateWalletRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useWalletMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiWalletDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiWalletSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["wallet", "search"] })
    }

    const createWalletMutation = useMutation({
        ...postApiWalletMutation(),
        onSuccess: () => {
            toast.success(t("wallet.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateWalletMutation = useMutation({
        ...putApiWalletMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("wallet.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiWalletByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiWalletDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteWalletMutation = useMutation({
        ...deleteApiWalletByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("wallet.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiWalletByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiWalletDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("wallet.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiWalletByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("wallet.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("wallet.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("wallet.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("wallet.bulk.deleteError"))
    })

    const createWalletWithValidation = (data: CreateWalletRequest, setError: UseFormSetError<CreateWalletRequest>, onSuccess?: () => void) => {
        createWalletMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("wallet.messages.create.error")
                }),
            },
        )
    }

    const updateWalletWithValidation = (data: UpdateWalletRequest, setError: UseFormSetError<UpdateWalletRequest>, onSuccess?: () => void) => {
        updateWalletMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("wallet.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createWalletMutation,
        updateMutation: updateWalletMutation,
        deleteMutation: deleteWalletMutation,
        bulkDeleteMutation,
        createWalletWithValidation,
        updateWalletWithValidation,
        deleteWallet: (id: string) => deleteWalletMutation.mutate({ path: { id } }),
        isMutating: createWalletMutation.isPending || updateWalletMutation.isPending || deleteWalletMutation.isPending || bulkDeleteMutation.isPending
    }
}
