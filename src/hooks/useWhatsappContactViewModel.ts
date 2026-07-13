import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiClientSearchOptions,
  postApiClientSearchQueryKey,
  getApiProductDropdownOptions,
  postApiClientMutation,
  putApiClientMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CreateClientRequest,
  SearchClientResponse,
} from "@/shared/api/generated/types.gen";
import { mapToClientModel, type ClientModel } from "@/models/client.model";

/**
 * Backs the "add / edit contact" action inside WhatsApp. A conversation has no
 * clientId, so we resolve the CRM Client by phone (global search via searchTerm)
 * — found → edit that client (product locked); not found → create a new one
 * (product chosen in the form). CRUD goes through the generated client SDK.
 */
export function useWhatsappContactViewModel(phone?: string | null) {
  const qc = useQueryClient();
  const term = (phone ?? "").trim();

  const searchQuery = useQuery({
    ...postApiClientSearchOptions({
      body: { searchTerm: term, pageNumber: 1, pageSize: 1 } as any,
    }),
    enabled: !!term,
    select: (res) =>
      ((res?.data?.items ?? [])[0] ?? null) as SearchClientResponse | null,
  });

  const existingDto = searchQuery.data ?? null;
  const existing: ClientModel | null = useMemo(
    () => (existingDto ? mapToClientModel(existingDto) : null),
    [existingDto],
  );
  const existingProductId = existingDto?.productId ?? undefined;

  const productsQuery = useQuery({
    ...getApiProductDropdownOptions(),
    select: (res: any) => (res?.data ?? []) as { id: string; name: string }[],
  });

  const createMutation = useMutation({ ...postApiClientMutation() });
  const updateMutation = useMutation({ ...putApiClientMutation() });

  const save = async (body: CreateClientRequest): Promise<boolean> => {
    try {
      if (existingDto?.id) {
        await updateMutation.mutateAsync({
          body: {
            ...body,
            id: existingDto.id,
            productId: body.productId ?? existingProductId,
          },
        });
        toast.success("Contact mis à jour");
      } else {
        await createMutation.mutateAsync({ body });
        toast.success("Contact ajouté");
      }
      qc.invalidateQueries({ queryKey: postApiClientSearchQueryKey() });
      await searchQuery.refetch();
      return true;
    } catch {
      toast.error("Erreur lors de l'enregistrement du contact");
      return false;
    }
  };

  return {
    existing,
    existingProductId,
    hasContact: !!existingDto,
    isLoading: searchQuery.isLoading,
    products: productsQuery.data ?? [],
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}
