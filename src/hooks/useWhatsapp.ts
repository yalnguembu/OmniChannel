import {
  keepPreviousData,
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
  getApiConversationDetailById,
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
  postApiWhatsAppSendTemplateClient,
  postApiUserSearch,
} from "@/shared/api/generated/sdk.gen";

// ─── Payload types (kept stable for consumers) ───────────────────────────────

export interface ConversationSearchParams {
  pageNumber?: number;
  pageSize?: number;
  status?: ConversationStatus;
  unreadOnly?: boolean;
  searchTerm?: string;
  /** Restrict to one WhatsApp sender (the `/wa/$senderId` route). */
  senderId?: string;
  /** Assigned agent id — `assignedToUser` (a uuid) on the backend. */
  assignedToUser?: string;
  /** INBOUND — waiting on us; OUTBOUND — we spoke last. */
  lastMessageDirection?: string;
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
/** One attachment queued in the media composer, with its own caption. */
export interface PendingMedia {
  file: File;
  caption?: string;
}
export interface SendMediaPayload {
  to: string;
  /** Sent one after another so WhatsApp keeps the composer's order. */
  items: PendingMedia[];
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

/** Messages load in small pages and grow upwards as the user scrolls back. */
export const MESSAGE_PAGE_SIZE = 30;

/**
 * How much more history a single "load more" pulls in when the in-chat
 * search finds nothing in what is already loaded.
 */
export const SEARCH_EXTEND_SIZE = 250;

// ─── Response helpers (hey-api result → envelope.data payload) ────────────────

function listOf<T>(res: any): T[] {
  const payload = res?.data?.data;
  return (Array.isArray(payload) ? payload : (payload?.items ?? [])) as T[];
}
function singleOf<T>(res: any): T | null {
  return (res?.data?.data ?? null) as T | null;
}

export interface PagedResult<T> {
  items: T[];
  hasNextPage: boolean;
  totalCount: number;
}

/**
 * Same envelope as `listOf`, but keeps the paging metadata the infinite
 * queries need. Falls back to a page-size comparison when the backend omits
 * `hasNextPage` (a bare array payload is by definition the whole result).
 */
function pagedOf<T>(res: any, pageSize: number): PagedResult<T> {
  const payload = res?.data?.data;
  if (Array.isArray(payload)) {
    return { items: payload as T[], hasNextPage: false, totalCount: payload.length };
  }
  const items = (payload?.items ?? []) as T[];
  const hasNextPage =
    typeof payload?.hasNextPage === "boolean"
      ? payload.hasNextPage
      : items.length === pageSize;
  return {
    items,
    hasNextPage,
    totalCount: payload?.totalCount ?? items.length,
  };
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const whatsappKeys = {
  all: ["whatsapp"] as const,
  conversations: (params: ConversationSearchParams) =>
    [...whatsappKeys.all, "conversations", params] as const,
  conversation: (id: string) => [...whatsappKeys.all, "conversation", id] as const,
  /** Without `limit`, a prefix key that invalidates every window size. */
  messages: (convId: string, limit?: number) =>
    (limit === undefined
      ? [...whatsappKeys.all, "messages", convId]
      : [...whatsappKeys.all, "messages", convId, limit]) as readonly unknown[],
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
          senderId: params.senderId,
          assignedToUser: params.assignedToUser,
          lastMessageDirection: params.lastMessageDirection,
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

/**
 * A single conversation, fetched by id.
 *
 * Needed when the inbox is opened straight on a conversation (a reload, or a
 * shared `?c=` link): the sidebar only holds the first pages of a list that
 * can run to tens of thousands of rows, so the open conversation is usually
 * absent from it and the header would have nothing to render.
 */
export function useConversationDetail(convId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: whatsappKeys.conversation(convId ?? ""),
    queryFn: async () =>
      singleOf<Conversation>(
        await getApiConversationDetailById({ path: { id: convId! } }),
      ),
    enabled: !!convId && enabled,
    staleTime: 60_000,
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

/** The newest `limit` messages of a conversation, in one request. */
export async function fetchMessageWindow(
  convId: string,
  limit: number,
): Promise<PagedResult<Message>> {
  return pagedOf<Message>(
    await getApiConversationMessageSearch({
      query: { id: convId, pageNumber: 1, pageSize: limit },
    }),
    limit,
  );
}

/**
 * Messages of one conversation, as a **growing window** rather than stitched
 * pages: always page 1, with `limit` raised as the user scrolls back.
 *
 * Page-based infinite loading drifts on a live thread — every message that
 * arrives shifts the boundaries, so page 2 starts returning rows page 1
 * already had. Re-reading the newest N cannot drift, and the store merges by
 * id so nothing is duplicated.
 */
export function useMessages(convId: string | null, limit: number) {
  return useQuery({
    queryKey: whatsappKeys.messages(convId ?? "", limit),
    queryFn: () => fetchMessageWindow(convId!, limit),
    enabled: !!convId,
    staleTime: 60_000,
    // Keeps the thread on screen while a larger window is being fetched.
    placeholderData: keepPreviousData,
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

/**
 * Sends every attachment in the composer, each as its own WhatsApp message
 * carrying its own caption — the native behaviour when several pictures are
 * picked at once. Uploads run one after another so the recipient sees them in
 * the composer's order, and a single failure doesn't abort the rest.
 */
export function useSendMedia() {
  const qc = useQueryClient();
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: async (payload: SendMediaPayload) => {
      let sent = 0;
      const failed: string[] = [];
      for (const item of payload.items) {
        // Backend routes by sender (multi-tenant), so SenderId is required —
        // omitting it is what produced the 400 Bad Request on uploads.
        const body = {
          To: payload.to,
          File: item.file,
          Caption: item.caption?.trim() || undefined,
          SenderId: selectedSenderId ?? undefined,
        };
        // Pick the endpoint from the real MIME type rather than the menu
        // choice (the "Photos & vidéos" picker also yields videos).
        const isImage = (item.file.type || "").startsWith("image/");
        try {
          await (isImage
            ? postApiWhatsAppSendImage({ body })
            : postApiWhatsAppSendDocument({ body }));
          sent += 1;
        } catch {
          failed.push(item.file.name);
        }
      }
      return { sent, failed };
    },
    onSuccess: ({ sent, failed }) => {
      qc.invalidateQueries({ queryKey: whatsappKeys.all });
      if (failed.length === 0) {
        toast.success(sent > 1 ? `${sent} fichiers envoyés` : "Fichier envoyé", {
          duration: 1500,
        });
      } else if (sent > 0) {
        toast.warning(`${sent} envoyé(s), échec : ${failed.join(", ")}`);
      } else {
        toast.error("Erreur lors de l'envoi du fichier");
      }
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
export interface SendTemplateClientPayload {
  templateId: string;
  senderId?: string;
  /** Recipient client id. */
  clientId: string;
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

// Send an approved template to a single client, addressed by external id
// — POST /api/WhatsApp/send/template/client.
export function useSendTemplateToClient() {
  const selectedSenderId = useWhatsAppStore((s) => s.selectedSenderId);
  return useMutation({
    mutationFn: (p: SendTemplateClientPayload) =>
      postApiWhatsAppSendTemplateClient({
        body: {
          templateId: p.templateId,
          senderId: p.senderId ?? selectedSenderId ?? undefined,
          clientId: p.clientId,
        },
      }),
    onSuccess: (res: any) => {
      const item = res?.data?.data ?? {};
      const status = item.status ?? "envoyé";
      if (item.error) {
        toast.error(`Échec de l'envoi : ${item.error}`);
      } else {
        toast.success(`Template ${status} ✓`);
      }
    },
    onError: (err: any) =>
      toast.error(err?.message || "Erreur lors de l'envoi du template"),
  });
}
