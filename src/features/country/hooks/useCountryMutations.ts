import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCountryMutation,
    putApiCountryMutation,
    deleteApiCountryByIdMutation,
    getApiCountryByIdQueryKey,
    getApiCountryDetailByIdQueryKey,
    getApiCountryDropdownQueryKey,
    postApiCountrySearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCountryRequest, UpdateCountryRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCountryMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCountryDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCountrySearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["country", "search"] })
    }

    const createCountryMutation = useMutation({
        ...postApiCountryMutation(),
        onSuccess: () => {
            toast.success(t("country.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCountryMutation = useMutation({
        ...putApiCountryMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("country.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCountryByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCountryDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCountryMutation = useMutation({
        ...deleteApiCountryByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("country.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCountryByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCountryDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("country.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCountryByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("country.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("country.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("country.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("country.bulk.deleteError"))
    })

    const createCountryWithValidation = (data: CreateCountryRequest, setError: UseFormSetError<CreateCountryRequest>, onSuccess?: () => void) => {
        createCountryMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("country.messages.create.error")
                }),
            },
        )
    }

    const updateCountryWithValidation = (data: UpdateCountryRequest, setError: UseFormSetError<UpdateCountryRequest>, onSuccess?: () => void) => {
        updateCountryMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("country.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCountryMutation,
        updateMutation: updateCountryMutation,
        deleteMutation: deleteCountryMutation,
        bulkDeleteMutation,
        createCountryWithValidation,
        updateCountryWithValidation,
        deleteCountry: (id: string) => deleteCountryMutation.mutate({ path: { id } }),
        isMutating: createCountryMutation.isPending || updateCountryMutation.isPending || deleteCountryMutation.isPending || bulkDeleteMutation.isPending
    }
}
