import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { errorMessage } from "@/api/client";
import * as apiEndpoints from "@/api/endpoints";
import type { ConversationSearchParams, LocalFile } from "@/api/endpoints";
import { toast } from "@/lib/toast";
import type { ConversationStatus } from "@/models/whatsapp.models";
import { useWhatsAppStore } from "@/store/whatsappStore";

/**
 * Couche données de l'inbox WhatsApp — portage de `src/hooks/useWhatsapp.ts`
 * du web sur les endpoints mobiles.
 */

// 30 conversations par page : le web en charge 60, mais une liste mobile
// n'affiche qu'une poignée de lignes à la fois.
const PAGE_SIZE = 30;

/** Les messages arrivent par petites fenêtres, qui grandissent en remontant. */
export const MESSAGE_PAGE_SIZE = 30;

/**
 * Ce qu'un élargissement ajoute quand la recherche interne ne trouve rien dans
 * ce qui est déjà chargé.
 */
export const SEARCH_EXTEND_SIZE = 250;

export const whatsappKeys = {
  all: ["whatsapp"] as const,
  conversations: (params: ConversationSearchParams) =>
    [...whatsappKeys.all, "conversations", params] as const,
  /** Sans `limit`, une clé-préfixe qui invalide toutes les tailles de fenêtre. */
  messages: (convId: string, limit?: number) =>
    (limit === undefined
      ? [...whatsappKeys.all, "messages", convId]
      : [...whatsappKeys.all, "messages", convId, limit]) as readonly unknown[],
  conversation: (convId: string) => [...whatsappKeys.all, "conversation", convId] as const,
  stats: () => [...whatsappKeys.all, "stats"] as const,
  users: () => [...whatsappKeys.all, "users"] as const,
  senders: () => [...whatsappKeys.all, "senders"] as const,
  templates: () => [...whatsappKeys.all, "templates"] as const,
  products: () => [...whatsappKeys.all, "products"] as const,
  segments: () => [...whatsappKeys.all, "segments"] as const,
  clientStatuses: () => [...whatsappKeys.all, "client-statuses"] as const,
  clientByPhone: (phone: string) => [...whatsappKeys.all, "client-by-phone", phone] as const,
};

// ─── Conversations ────────────────────────────────────────────────────────────

export function useConversations(params: ConversationSearchParams) {
  return useInfiniteQuery({
    queryKey: whatsappKeys.conversations(params),
    queryFn: async ({ pageParam }) => ({
      items: await apiEndpoints.searchConversations({
        ...params,
        pageNumber: pageParam as number,
        pageSize: PAGE_SIZE,
      }),
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.items.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    // Pas de staleTime : chaque filtre / recherche donne une clé différente et
    // on veut toujours un aller-retour serveur au changement de filtre (y
    // compris en revenant sur un filtre déjà visité) plutôt qu'un cache figé.
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

/** Détail d'une conversation — sert quand on ouvre un chat sans passer par la liste. */
export function useConversation(convId: string | null) {
  return useQuery({
    queryKey: whatsappKeys.conversation(convId ?? ""),
    queryFn: () => apiEndpoints.getConversation(convId!),
    enabled: !!convId,
    staleTime: 60_000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: whatsappKeys.stats(),
    queryFn: apiEndpoints.getStats,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: whatsappKeys.users(),
    queryFn: apiEndpoints.searchUsers,
    staleTime: 300_000,
  });
}

export function useSenders() {
  return useQuery({
    queryKey: whatsappKeys.senders(),
    queryFn: apiEndpoints.getSenders,
    staleTime: 300_000,
  });
}

export function useTemplates(enabled = true) {
  return useQuery({
    queryKey: whatsappKeys.templates(),
    queryFn: apiEndpoints.getTemplates,
    enabled,
    staleTime: 300_000,
  });
}

export function useProducts(enabled = true) {
  return useQuery({
    queryKey: whatsappKeys.products(),
    queryFn: apiEndpoints.getProducts,
    enabled,
    staleTime: 300_000,
  });
}

export function useSegments(enabled = true) {
  return useQuery({
    queryKey: whatsappKeys.segments(),
    queryFn: apiEndpoints.searchSegments,
    enabled,
    staleTime: 300_000,
  });
}

export function useUpdateConversationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ConversationStatus }) =>
      apiEndpoints.updateConversationStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      qc.invalidateQueries({ queryKey: whatsappKeys.stats() });
      toast.success("Statut mis à jour");
    },
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de la mise à jour du statut")),
  });
}

export function useAssignConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      apiEndpoints.assignConversation(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      toast.success("Conversation assignée");
    },
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de l'assignation")),
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

/**
 * Messages d'une conversation, en **fenêtre croissante** : toujours la page 1,
 * avec `limit` relevé au fur et à mesure que l'on remonte le fil.
 */
export function useMessages(convId: string | null, limit: number) {
  return useQuery({
    queryKey: whatsappKeys.messages(convId ?? "", limit),
    queryFn: () => apiEndpoints.fetchMessageWindow(convId!, limit),
    enabled: !!convId,
    staleTime: 60_000,
    // Garde le fil à l'écran pendant qu'une fenêtre plus large arrive.
    placeholderData: keepPreviousData,
  });
}

// ─── Envois ───────────────────────────────────────────────────────────────────

export interface SendTextPayload {
  to: string;
  body: string;
}
export interface SendReplyPayload extends SendTextPayload {
  replyToExternalMessageId: string;
}
/** Un attachement en file dans le composeur, avec sa propre légende. */
export interface PendingMedia {
  file: LocalFile;
  caption?: string;
}

export interface SendMediaPayload {
  to: string;
  /** Envoyés l'un après l'autre, pour que WhatsApp garde l'ordre du composeur. */
  items: PendingMedia[];
}

export function useSendText() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: SendTextPayload) => apiEndpoints.sendText(p.to, p.body, selectedSenderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
    },
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de l'envoi du message")),
  });
}

export function useSendReply() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: SendReplyPayload) =>
      apiEndpoints.sendReply(p.to, p.body, p.replyToExternalMessageId, selectedSenderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
    },
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de l'envoi de la réponse")),
  });
}

export function useSendMedia() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: async (p: SendMediaPayload) => {
      // En série, pas en parallèle : WhatsApp affiche les messages dans l'ordre
      // d'arrivée, et un `Promise.all` les mélangerait.
      for (const item of p.items) {
        await apiEndpoints.sendMedia(p.to, item.file, item.caption, selectedSenderId);
      }
      return p.items.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
      toast.success(count > 1 ? `${count} fichiers envoyés` : "Fichier envoyé", 1500);
    },
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de l'envoi du fichier")),
  });
}

export function useSendFlow() {
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: { to: string; flowToken: string }) =>
      apiEndpoints.sendFlow(p.to, p.flowToken, selectedSenderId),
    onSuccess: () => toast.success("Flow envoyé"),
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de l'envoi du flow")),
  });
}

export function useSendTemplateToClient() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: { templateId: string; clientId: string }) =>
      apiEndpoints.sendTemplateToClient(p.templateId, p.clientId, selectedSenderId),
    onSuccess: (item) => {
      if (item?.error) {
        toast.error(`Échec de l'envoi : ${item.error}`);
        return;
      }
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
      toast.success(`Template ${item?.status ?? "envoyé"}`);
    },
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de l'envoi du template")),
  });
}

/** Compte-rendu de diffusion, quels que soient les noms de champs renvoyés. */
function broadcastToast(result: Record<string, number> | null) {
  const ok = result?.successCount ?? result?.sent ?? 0;
  const ko = result?.failureCount ?? result?.failed ?? 0;
  toast.success(`Diffusion lancée (succès : ${ok}, échecs : ${ko})`, 4000);
}

export function useSendTemplateToSegment() {
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: { templateId: string; segmentId: string }) =>
      apiEndpoints.sendTemplateToSegment(p.templateId, p.segmentId, selectedSenderId),
    onSuccess: broadcastToast,
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de la diffusion du template")),
  });
}

export function useSendTemplateFile() {
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: {
      templateId: string;
      file: LocalFile;
      productId?: string;
      mappingOverride?: string;
    }) => apiEndpoints.sendTemplateFile({ ...p, senderId: selectedSenderId }),
    onSuccess: broadcastToast,
    onError: (e) => toast.error(errorMessage(e, "Erreur lors de la diffusion du template")),
  });
}

/**
 * Contact CRM correspondant au numéro de la conversation. L'envoi de template
 * s'adresse à un `clientId` : sans contact résolu, le bouton reste inactif.
 */
export function useClientByPhone(phone: string | null | undefined) {
  return useQuery({
    queryKey: whatsappKeys.clientByPhone(phone ?? ""),
    queryFn: async () => {
      const results = await apiEndpoints.findClientByPhone(phone!);
      return results[0] ?? null;
    },
    enabled: !!phone,
    staleTime: 300_000,
  });
}
