import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorMessage } from "@/api/client";
import {
  changeClientStatus,
  changeContactChannelStatus,
  createClient,
  getClientStatuses,
  getContactChannelStatuses,
  updateClient,
  type ClientBody,
} from "@/api/endpoints";
import { toast } from "@/lib/toast";
import { useClientByPhone, useProducts, whatsappKeys } from "./useWhatsapp";

/**
 * Contact CRM rattaché au numéro d'une discussion — portage de
 * `useWhatsappContactViewModel.ts` du web.
 *
 * Une conversation ne porte pas de `clientId` : on résout le client par son
 * téléphone (recherche globale via `searchTerm`). Trouvé → on l'édite (le
 * produit est verrouillé) ; absent → on le crée (produit choisi dans le
 * formulaire). C'est aussi ce qui débloque l'envoi de template, qui adresse un
 * client et non un numéro.
 */
export function useWhatsappContact(phone?: string | null) {
  const qc = useQueryClient();
  const term = (phone ?? "").trim();

  const searchQuery = useClientByPhone(term || null);
  const existing = searchQuery.data ?? null;

  const productsQuery = useProducts();

  const statusesQuery = useQuery({
    queryKey: whatsappKeys.clientStatuses(),
    queryFn: getClientStatuses,
    staleTime: 300_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (body: ClientBody) => {
      if (existing) {
        // `updateClient` repart de la fiche existante : le produit et les champs
        // absents du formulaire mobile (adresse, langue, attributs…) sont
        // conservés au lieu d'être vidés par le PUT.
        await updateClient(existing, body);
        return "updated" as const;
      }
      await createClient(body);
      return "created" as const;
    },
    onSuccess: async (kind) => {
      toast.success(kind === "updated" ? "Contact mis à jour" : "Contact ajouté");
      // La résolution téléphone → client alimente l'envoi de template : il faut
      // la rafraîchir tout de suite pour que le bouton devienne actif.
      await qc.invalidateQueries({ queryKey: whatsappKeys.clientByPhone(term) });
    },
    onError: (e) =>
      toast.error(errorMessage(e, "Erreur lors de l'enregistrement du contact")),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      changeClientStatus(id, status),
    onSuccess: async () => {
      toast.success("Statut du client mis à jour");
      await qc.invalidateQueries({ queryKey: whatsappKeys.clientByPhone(term) });
    },
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de la mise à jour du statut")),
  });

  return {
    existing,
    hasContact: !!existing,
    changeStatus: (status: string) => {
      if (existing?.id) statusMutation.mutate({ id: existing.id, status });
    },
    isLoading: searchQuery.isLoading,
    products: productsQuery.data ?? [],
    statuses: statusesQuery.data ?? [],
    save: (body: ClientBody) => saveMutation.mutateAsync(body).then(() => true).catch(() => false),
    isSaving: saveMutation.isPending,
  };
}

/**
 * Statut de délivrabilité du canal (le numéro lui-même, indépendamment du
 * contact CRM) — portage de `useContactChannel.ts` du web. Le vocabulaire
 * appartient au backend : on affiche la liste brute qu'il renvoie.
 */
export function useContactChannel() {
  const statusesQuery = useQuery({
    queryKey: [...whatsappKeys.all, "contact-channel-statuses"],
    queryFn: getContactChannelStatuses,
    staleTime: 300_000,
  });

  const mutation = useMutation({
    mutationFn: ({ phoneNumber, status }: { phoneNumber: string; status: string }) =>
      changeContactChannelStatus(phoneNumber, status),
    onSuccess: () => toast.success("Statut du canal mis à jour"),
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de la mise à jour du statut")),
  });

  return {
    statuses: statusesQuery.data ?? [],
    changeStatus: (phoneNumber: string, status: string) =>
      mutation.mutate({ phoneNumber, status }),
    isPending: mutation.isPending,
  };
}
