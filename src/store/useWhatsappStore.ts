import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Conversation, Filter, Message, Stats, User } from '@/models/whatsapp.models';

export interface ReplyTo {
  messageId: string;
  content: string;
  author: string;
}

/** Sidebar filters that live alongside the status filter and the search term. */
export interface ConversationFilters {
  /** Assigned agent id; '' = any. */
  assignedToUser: string;
  /** 'INBOUND' | 'OUTBOUND' | '' (any) — direction of the last message. */
  lastMessageDirection: string;
  /** Inclusive local-day bounds on lastMessageAt, as `yyyy-mm-dd`; '' = open. */
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_CONVERSATION_FILTERS: ConversationFilters = {
  assignedToUser: '',
  lastMessageDirection: '',
  dateFrom: '',
  dateTo: '',
};

interface WhatsAppState {
  // Conversations
  conversations: Conversation[];
  conversationById: Record<string, Conversation>;
  activeConversationId: string | null;
  filter: Filter;
  search: string;
  filters: ConversationFilters;
  stats: Stats | null;
  selectedSenderId: string | null;
  senders: Array<{ id: string; senderName: string }>;

  // Messages
  messages: Message[];
  chatSearch: string;
  replyTo: ReplyTo | null;

  // UI
  users: User[];
  isMobileChatOpen: boolean;

  // Actions — conversations
  setConversations: (convs: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setFilter: (filter: Filter) => void;
  setSearch: (search: string) => void;
  setFilters: (patch: Partial<ConversationFilters>) => void;
  resetFilters: () => void;
  setStats: (stats: Stats) => void;
  setSelectedSenderId: (senderId: string | null) => void;
  setSenders: (senders: Array<{ id: string; senderName: string }>) => void;
  upsertConversation: (conv: Conversation) => void;
  /** Index a conversation for lookup without inserting it in the visible list. */
  cacheConversation: (conv: Conversation) => void;
  batchUpsertConversations: (convs: Conversation[]) => void;
  clearUnreadBadge: (id: string) => void;

  // Actions — messages
  setMessages: (msgs: Message[]) => void;
  /** Union by id — keeps live SignalR arrivals that no fetched page holds yet. */
  mergeMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  updateMessage: (msg: Message) => void;
  setChatSearch: (term: string) => void;
  setReplyTo: (reply: ReplyTo | null) => void;

  // Actions — UI
  setUsers: (users: User[]) => void;
  setMobileChatOpen: (open: boolean) => void;

  // Computed helpers
  getActiveConversation: () => Conversation | null;
}

export const useWhatsAppStore = create<WhatsAppState>()(
  devtools(
    (set, get) => ({
      conversations: [],
      conversationById: {},
      activeConversationId: null,
      filter: 'ALL',
      search: '',
      filters: EMPTY_CONVERSATION_FILTERS,
      stats: null,
      selectedSenderId: null,
      senders: [],
      messages: [],
      chatSearch: '',
      replyTo: null,
      users: [],
      isMobileChatOpen: false,

      // ── Conversations ──────────────────────────────────────────────────────────

      setConversations: (conversations) =>
        set((state) => {
          const conversationById: Record<string, Conversation> = {};
          for (const c of conversations) conversationById[c.id] = c;
          // Preserve the currently-open conversation even when the filtered /
          // searched result set no longer contains it (e.g. it was just read
          // under the UNREAD filter). Otherwise getActiveConversation() returns
          // null and the chat header + send actions silently stop working.
          const activeId = state.activeConversationId;
          if (activeId && !conversationById[activeId] && state.conversationById[activeId]) {
            conversationById[activeId] = state.conversationById[activeId];
          }
          return { conversations, conversationById };
        }),

      // Messages are cleared on switch: they are paged now, so leaving the
      // previous conversation's pages in place would let them show through
      // while the new conversation's first page is still in flight.
      setActiveConversationId: (id) =>
        set((state) =>
          state.activeConversationId === id
            ? state
            : { activeConversationId: id, replyTo: null, chatSearch: '', messages: [] },
        ),

      setFilter: (filter) => set({ filter }),

      setSearch: (search) => set({ search }),

      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),

      resetFilters: () => set({ filters: EMPTY_CONVERSATION_FILTERS }),

      setStats: (stats) => set({ stats }),

      setSelectedSenderId: (senderId) => set({ selectedSenderId: senderId }),

      setSenders: (senders) => set({ senders }),

      // Used when a conversation is opened by id (deep link / reload) while the
      // sidebar holds a filtered, paginated slice that does not contain it.
      // Deliberately not added to `conversations`: it would show up in the list
      // as a row that does not match the active filters.
      cacheConversation: (conv) =>
        set((state) =>
          state.conversationById[conv.id]
            ? state
            : {
                conversationById: { ...state.conversationById, [conv.id]: conv },
              },
        ),

      upsertConversation: (conv) =>
        set((state) => {
          const existing = state.conversationById[conv.id];
          const merged = existing ? { ...existing, ...conv } : conv;
          const conversationById = { ...state.conversationById, [conv.id]: merged };

          let conversations: Conversation[];
          if (existing) {
            const idx = state.conversations.findIndex((c) => c.id === conv.id);
            conversations = [...state.conversations];
            conversations[idx] = merged;
            const [c] = conversations.splice(idx, 1);
            conversations.unshift(c);
          } else {
            conversations = [merged, ...state.conversations];
          }

          return { conversations, conversationById };
        }),

      // Batch multiple conversation upserts into a single state update — used by
      // SignalR to coalesce rapid events into one React re-render.
      batchUpsertConversations: (convs) =>
        set((state) => {
          if (convs.length === 0) return state;

          const conversationById = { ...state.conversationById };

          // Deduplicate: keep last update per id (Map preserves insertion order,
          // later set() calls overwrite the value while keeping the key position).
          const latestById = new Map<string, Conversation>();
          for (const conv of convs) latestById.set(conv.id, conv);

          const updatedIds = new Set(latestById.keys());
          const mergedConvs: Conversation[] = [];

          for (const [id, conv] of latestById) {
            const existing = conversationById[id];
            const merged = existing ? { ...existing, ...conv } : conv;
            conversationById[id] = merged;
            mergedConvs.push(merged);
          }

          const base = state.conversations.filter((c) => !updatedIds.has(c.id));
          return { conversations: [...mergedConvs, ...base], conversationById };
        }),

      clearUnreadBadge: (id) =>
        set((state) => {
          const existing = state.conversationById[id];
          if (!existing || existing.unreadCount === 0) return state;
          const updated = { ...existing, unreadCount: 0 };
          return {
            conversations: state.conversations.map((c) => (c.id === id ? updated : c)),
            conversationById: { ...state.conversationById, [id]: updated },
          };
        }),

      // ── Messages ──────────────────────────────────────────────────────────────

      setMessages: (messages) => set({ messages }),

      // Fetched pages are merged, never substituted: a SignalR arrival that
      // landed between two fetches isn't in any page yet, and replacing the
      // list wholesale would make it disappear until the next refetch.
      mergeMessages: (incoming) =>
        set((state) => {
          if (incoming.length === 0) return state;
          const byId = new Map(state.messages.map((m) => [m.id, m]));
          let changed = false;
          for (const msg of incoming) {
            const existing = byId.get(msg.id);
            if (!existing) {
              byId.set(msg.id, msg);
              changed = true;
            } else {
              const merged = { ...existing, ...msg };
              // Cheap identity check — avoids a re-render when a refetch
              // returns byte-identical rows, which is the common case.
              for (const k of Object.keys(merged) as (keyof Message)[]) {
                if (merged[k] !== existing[k]) {
                  byId.set(msg.id, merged);
                  changed = true;
                  break;
                }
              }
            }
          }
          return changed ? { messages: [...byId.values()] } : state;
        }),

      appendMessage: (msg) =>
        set((state) => {
          if (state.messages.some((m) => m.id === msg.id)) return state;
          return { messages: [...state.messages, msg] };
        }),

      updateMessage: (msg) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)),
        })),

      setChatSearch: (chatSearch) => set({ chatSearch }),

      setReplyTo: (replyTo) => set({ replyTo }),

      // ── UI ─────────────────────────────────────────────────────────────────────

      setUsers: (users) => set({ users }),

      setMobileChatOpen: (isMobileChatOpen) => set({ isMobileChatOpen }),

      // ── Computed ───────────────────────────────────────────────────────────────

      getActiveConversation: () => {
        const { conversationById, activeConversationId } = get();
        return activeConversationId ? (conversationById[activeConversationId] ?? null) : null;
      },
    }),
    { name: 'whatsapp-store' }
  )
);
