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

      // ── Conversations ──────────────────────────────────────────────────────

      setConversations: (conversations) => set({ conversations }),

      setActiveConversationId: (id) =>
        set({ activeConversationId: id, replyTo: null, chatSearch: '' }),

      setFilter: (filter) => set({ filter }),

      setSearch: (search) => set({ search }),

      setStats: (stats) => set({ stats }),

      setSelectedSenderId: (senderId) => set({ selectedSenderId: senderId }),

      setSenders: (senders) => set({ senders }),

      upsertConversation: (conv) =>
        set((state) => {
          const idx = state.conversations.findIndex((c) => c.id === conv.id);
          let updated: Conversation[];
          if (idx !== -1) {
            updated = [...state.conversations];
            updated[idx] = { ...updated[idx], ...conv };
            // Move to top
            const [c] = updated.splice(idx, 1);
            updated.unshift(c);
          } else {
            updated = [conv, ...state.conversations];
          }
          return { conversations: updated };
        }),

      clearUnreadBadge: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: 0 } : c
          ),
        })),

      // ── Messages ──────────────────────────────────────────────────────────

      setMessages: (messages) => set({ messages }),

      appendMessage: (msg) =>
        set((state) => {
          const exists = state.messages.find((m) => m.id === msg.id);
          if (exists) return state;
          return { messages: [...state.messages, msg] };
        }),

      updateMessage: (msg) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)),
        })),

      setChatSearch: (chatSearch) => set({ chatSearch }),

      setReplyTo: (replyTo) => set({ replyTo }),

      // ── UI ─────────────────────────────────────────────────────────────────

      setUsers: (users) => set({ users }),

      setMobileChatOpen: (isMobileChatOpen) => set({ isMobileChatOpen }),

      // ── Computed ───────────────────────────────────────────────────────────

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId) ?? null;
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
