import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Conversation, Filter, Message, Stats, User } from '@/models/whatsapp.models';

export interface ReplyTo {
  messageId: string;
  content: string;
  author: string;
}

interface WhatsAppState {
  // Conversations
  conversations: Conversation[];
  conversationById: Record<string, Conversation>;
  activeConversationId: string | null;
  filter: Filter;
  search: string;
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
  setStats: (stats: Stats) => void;
  setSelectedSenderId: (senderId: string | null) => void;
  setSenders: (senders: Array<{ id: string; senderName: string }>) => void;
  upsertConversation: (conv: Conversation) => void;
  batchUpsertConversations: (convs: Conversation[]) => void;
  clearUnreadBadge: (id: string) => void;

  // Actions — messages
  setMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  updateMessage: (msg: Message) => void;
  setChatSearch: (term: string) => void;
  setReplyTo: (reply: ReplyTo | null) => void;

  // Actions — UI
  setUsers: (users: User[]) => void;
  setMobileChatOpen: (open: boolean) => void;

  // Computed helpers
  getActiveConversation: () => Conversation | null;
  getFilteredMessages: () => Message[];
}

export const useWhatsAppStore = create<WhatsAppState>()(
  devtools(
    (set, get) => ({
      conversations: [],
      conversationById: {},
      activeConversationId: null,
      filter: 'ALL',
      search: '',
      stats: null,
      selectedSenderId: null,
      senders: [],
      messages: [],
      chatSearch: '',
      replyTo: null,
      users: [],
      isMobileChatOpen: false,

      // ── Conversations ──────────────────────────────────────────────────────────

      setConversations: (conversations) => {
        const conversationById: Record<string, Conversation> = {};
        for (const c of conversations) conversationById[c.id] = c;
        set({ conversations, conversationById });
      },

      setActiveConversationId: (id) =>
        set({ activeConversationId: id, replyTo: null, chatSearch: '' }),

      setFilter: (filter) => set({ filter }),

      setSearch: (search) => set({ search }),

      setStats: (stats) => set({ stats }),

      setSelectedSenderId: (senderId) => set({ selectedSenderId: senderId }),

      setSenders: (senders) => set({ senders }),

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

      getFilteredMessages: () => {
        const { messages, chatSearch } = get();
        if (!chatSearch) return messages;
        return messages.filter((m) =>
          (m.content || '').toLowerCase().includes(chatSearch.toLowerCase())
        );
      },
    }),
    { name: 'whatsapp-store' }
  )
);
