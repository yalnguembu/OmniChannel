import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Conversation,
  ConversationStatus,
  Message,
  Stats,
  User,
} from "@/models/whatsapp.models";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import {
  getApiConversationSearch,
  getApiConversationStats,
  getApiConversationMessageSearch,
  putApiConversationStatus,
  putApiConversationAssign,
  postApiWhatsAppSendText,
  postApiWhatsAppSendReply,
  postApiWhatsAppSendImage,
  postApiWhatsAppSendDocument,
  postApiWhatsAppSendFlow,
  postApiWhatsAppSendTemplateSegment,
  postApiWhatsAppSendTemplateFile,
  postApiUserSearch,
} from "@/shared/api/generated/sdk.gen";

// ─── Payload types (kept stable for consumers) ───────────────────────────────

export interface ConversationSearchParams {
  pageNumber?: number;
  pageSize?: number;
  status?: ConversationStatus;
  unreadOnly?: boolean;
  searchTerm?: string;
}
export interface SendTextPayload {
  to: string;
  body: string;
}
export interface SendReplyPayload {
  to: string;
  body: string;
  replyToExternalMessageId: string;
}
export interface SendMediaPayload {
  to: string;
  type: "image" | "audio" | "document";
  file: File;
  caption?: string;
}
export interface SendFlowPayload {
  to: string;
  flowToken: string;
}
export interface BulkSendPayload {
  type: "j0" | "j3";
  file: File;
}

const PAGE_SIZE = 60;

// ─── Response helpers (hey-api result → envelope.data payload) ────────────────

function listOf<T>(res: any): T[] {
  const payload = res?.data?.data;
  return (Array.isArray(payload) ? payload : (payload?.items ?? [])) as T[];
}
function singleOf<T>(res: any): T | null {
  return (res?.data?.data ?? null) as T | null;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const whatsappKeys = {
  all: ["whatsapp"] as const,
  conversations: (params: ConversationSearchParams) =>
    [...whatsappKeys.all, "conversations", params] as const,
  messages: (convId: string) =>
    [...whatsappKeys.all, "messages", convId] as const,
  stats: () => [...whatsappKeys.all, "stats"] as const,
  users: () => [...whatsappKeys.all, "users"] as const,
};

// ─── Conversations ────────────────────────────────────────────────────────────

export function useConversations(params: ConversationSearchParams) {
  return useInfiniteQuery({
    queryKey: whatsappKeys.conversations(params),
    queryFn: async ({ pageParam }) => {
      const res = await getApiConversationSearch({
        query: {
          pageNumber: pageParam as number,
          pageSize: PAGE_SIZE,
          status: params.status,
          unreadOnly: params.unreadOnly,
          searchTerm: params.searchTerm,
        },
      });
      return { items: listOf<Conversation>(res) };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.items.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    // No staleTime: each filter/search change keys a different query, and we
    // want the list always refetched from the backend on a filter switch
    // (including switching back to a previously-used filter) rather than served
    // stale from cache.
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: whatsappKeys.stats(),
    queryFn: async () =>
      singleOf<Stats>(await getApiConversationStats({ query: {} })),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: whatsappKeys.users(),
    queryFn: async () =>
      listOf<User>(
        await postApiUserSearch({ body: { pageNumber: 1, pageSize: 100 } }),
      ),
    staleTime: 300_000,
  });
}

export function useUpdateConversationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ConversationStatus }) =>
      putApiConversationStatus({ body: { id, status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      qc.invalidateQueries({ queryKey: whatsappKeys.stats() });
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour du statut"),
  });
}

export function useAssignConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      putApiConversationAssign({ body: { id, userId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
      toast.success("Conversation assignée");
    },
    onError: () => toast.error("Erreur lors de l'assignation"),
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function useMessages(convId: string | null) {
  return useQuery({
    queryKey: whatsappKeys.messages(convId ?? ""),
    queryFn: async () =>
      listOf<Message>(
        await getApiConversationMessageSearch({
          query: { id: convId!, pageNumber: 1, pageSize: 250 },
        }),
      ),
    enabled: !!convId,
    staleTime: 60_000,
  });
}

// ─── Send ─────────────────────────────────────────────────────────────────────

export function useSendText() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (payload: SendTextPayload) =>
      postApiWhatsAppSendText({
        body: {
          to: payload.to,
          body: payload.body,
          senderId: selectedSenderId ?? undefined,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
      toast.success("Message envoyé", { duration: 1500 });
    },
    onError: () => toast.error("Erreur lors de l'envoi du message"),
  });
}

export function useSendReply() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (payload: SendReplyPayload) =>
      postApiWhatsAppSendReply({
        body: {
          to: payload.to,
          body: payload.body,
          replyToExternalMessageId: payload.replyToExternalMessageId,
          senderId: selectedSenderId ?? undefined,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
      toast.success("Réponse envoyée", { duration: 1500 });
    },
    onError: () => toast.error("Erreur lors de l'envoi de la réponse"),
  });
}

export function useSendMedia() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (payload: SendMediaPayload) => {
      // Backend routes by sender (multi-tenant), so SenderId is required —
      // omitting it is what produced the 400 Bad Request on uploads.
      const body = {
        To: payload.to,
        File: payload.file,
        Caption: payload.caption || undefined,
        SenderId: selectedSenderId ?? undefined,
      };
      // Pick the endpoint from the real MIME type rather than the menu choice
      // (the "Photos & vidéos" picker also yields videos / non-images).
      const isImage = (payload.file.type || "").startsWith("image/");
      return isImage
        ? postApiWhatsAppSendImage({ body })
        : postApiWhatsAppSendDocument({ body });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
      toast.success("Fichier envoyé", { duration: 1500 });
    },
    onError: () => toast.error("Erreur lors de l'envoi du fichier"),
  });
}

export function useSendFlow() {
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (payload: SendFlowPayload) =>
      postApiWhatsAppSendFlow({
        body: {
          to: payload.to,
          flowToken: payload.flowToken,
          senderId: selectedSenderId ?? undefined,
        },
      }),
    onSuccess: () => toast.success("Flow envoyé ✓"),
    onError: () => toast.error("Erreur lors de l'envoi du flow"),
  });
}

// ─── Template broadcast (approved WhatsApp template → segment / file) ──────────

export interface SendTemplateSegmentPayload {
  templateId: string;
  senderId?: string;
  segmentId: string;
}
export interface SendTemplateFilePayload {
  templateId: string;
  senderId?: string;
  productId?: string;
  file: File;
  mappingOverride?: string;
}

function broadcastToast(res: any) {
  const data = res?.data?.data ?? {};
  const ok = data.successCount ?? data.sent ?? 0;
  const ko = data.failureCount ?? data.failed ?? 0;
  toast.success(`Diffusion lancée ✓ (Succès: ${ok}, Échecs: ${ko})`);
}

export function useSendTemplateToSegment() {
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: SendTemplateSegmentPayload) =>
      postApiWhatsAppSendTemplateSegment({
        body: {
          templateId: p.templateId,
          senderId: p.senderId ?? selectedSenderId ?? undefined,
          segmentId: p.segmentId,
        },
      }),
    onSuccess: broadcastToast,
    onError: (err: any) =>
      toast.error(err?.message || "Erreur lors de la diffusion du template"),
  });
}

export function useSendTemplateFile() {
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: SendTemplateFilePayload) =>
      postApiWhatsAppSendTemplateFile({
        body: {
          file: p.file,
          templateId: p.templateId,
          senderId: p.senderId ?? selectedSenderId ?? undefined,
          productId: p.productId,
          mappingOverride: p.mappingOverride,
        },
      }),
    onSuccess: broadcastToast,
    onError: (err: any) =>
      toast.error(err?.message || "Erreur lors de la diffusion du template"),
  });
}
