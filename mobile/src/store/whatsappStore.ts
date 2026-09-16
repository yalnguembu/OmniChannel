import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Conversation,
  Filter,
  Message,
  Sender,
  Stats,
  User,
} from "@/models/whatsapp.models";

/** Filtres de liste qui s'ajoutent au statut et au terme de recherche. */
export interface ConversationFilters {
  /** Id de l'agent assigné ; '' = tous. */
  assignedToUser: string;
  /** 'INBOUND' | 'OUTBOUND' | '' (toutes) — direction du dernier message. */
  lastMessageDirection: string;
  /** Bornes de jours locaux, incluses, en `aaaa-mm-jj` ; '' = ouvert. */
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_CONVERSATION_FILTERS: ConversationFilters = {
  assignedToUser: "",
  lastMessageDirection: "",
  dateFrom: "",
  dateTo: "",
};

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
  filters: ConversationFilters;
  stats: Stats | null;
  selectedSenderId: string | null;
  senders: Sender[];

  // Messages
  messages: Message[];
  chatSearch: string;
  replyTo: ReplyTo | null;

  // Divers
  users: User[];
  /** Faux jusqu'à ce que l'expéditeur persisté soit relu (AsyncStorage est async). */
  hydrated: boolean;

  setConversations: (convs: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setFilter: (filter: Filter) => void;
  setSearch: (search: string) => void;
  setFilters: (patch: Partial<ConversationFilters>) => void;
  resetFilters: () => void;
  setStats: (stats: Stats) => void;
  setSelectedSenderId: (senderId: string | null) => void;
  setSenders: (senders: Sender[]) => void;
  upsertConversation: (conv: Conversation) => void;
  batchUpsertConversations: (convs: Conversation[]) => void;
  clearUnreadBadge: (id: string) => void;

  setMessages: (msgs: Message[]) => void;
  /** Union par id — conserve les arrivées SignalR qu'aucune fenêtre ne porte encore. */
  mergeMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  updateMessage: (msg: Message) => void;
  setChatSearch: (term: string) => void;
  setReplyTo: (reply: ReplyTo | null) => void;

  setUsers: (users: User[]) => void;

  getActiveConversation: () => Conversation | null;
}

/**
 * Store de l'inbox WhatsApp — portage de `src/store/useWhatsappStore.ts` du web.
 * Seul l'expéditeur sélectionné est persisté : sur le web il vit dans l'URL
 * (`/wa/$senderId`), ici il n'y a pas d'URL à recharger.
 */
export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      conversationById: {},
      activeConversationId: null,
      filter: "ALL",
      search: "",
      filters: EMPTY_CONVERSATION_FILTERS,
      stats: null,
      selectedSenderId: null,
      senders: [],
      messages: [],
      chatSearch: "",
      replyTo: null,
      users: [],
      hydrated: false,

      // ── Conversations ────────────────────────────────────────────────────────

      setConversations: (conversations) =>
        set((state) => {
          const conversationById: Record<string, Conversation> = {};
          for (const c of conversations) conversationById[c.id] = c;
          // On conserve la conversation ouverte même si le filtre / la recherche
          // ne la contient plus (ex. elle vient d'être lue sous le filtre NON
          // LUES) : sinon `getActiveConversation()` renvoie null et l'en-tête du
          // chat comme les envois cessent silencieusement de fonctionner.
          const activeId = state.activeConversationId;
          if (activeId && !conversationById[activeId] && state.conversationById[activeId]) {
            conversationById[activeId] = state.conversationById[activeId];
          }
          return { conversations, conversationById };
        }),

      // Les messages sont purgés au changement : ils sont paginés, laisser les
      // fenêtres de la conversation précédente les laisserait apparaître le
      // temps que la première fenêtre de la nouvelle arrive.
      setActiveConversationId: (id) =>
        set((state) =>
          state.activeConversationId === id
            ? state
            : { activeConversationId: id, replyTo: null, chatSearch: "", messages: [] },
        ),

      setFilter: (filter) => set({ filter }),

      setSearch: (search) => set({ search }),

      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),

      resetFilters: () => set({ filters: EMPTY_CONVERSATION_FILTERS }),

      setStats: (stats) => set({ stats }),

      setSelectedSenderId: (selectedSenderId) => set({ selectedSenderId }),

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
            if (idx >= 0) {
              conversations.splice(idx, 1);
            }
            conversations.unshift(merged);
          } else {
            conversations = [merged, ...state.conversations];
          }

          return { conversations, conversationById };
        }),

      // Regroupe plusieurs upserts en une seule mise à jour — utilisé par
      // SignalR pour coalescer une rafale d'événements en un seul rendu.
      batchUpsertConversations: (convs) =>
        set((state) => {
          if (convs.length === 0) return state;

          const conversationById = { ...state.conversationById };

          // Déduplication : on garde la dernière version par id (une Map
          // conserve l'ordre d'insertion, un `set` ultérieur écrase la valeur
          // sans déplacer la clé).
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
          if (!existing || (existing.unreadCount ?? 0) === 0) return state;
          const updated = { ...existing, unreadCount: 0 };
          return {
            conversations: state.conversations.map((c) => (c.id === id ? updated : c)),
            conversationById: { ...state.conversationById, [id]: updated },
          };
        }),

      // ── Messages ─────────────────────────────────────────────────────────────

      setMessages: (messages) => set({ messages }),

      // Les fenêtres récupérées sont fusionnées, jamais substituées : un message
      // arrivé par SignalR entre deux requêtes n'est dans aucune fenêtre, et
      // remplacer la liste le ferait disparaître jusqu'au prochain rechargement.
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
              // Évite un nouveau tableau (donc un rendu) quand rien ne bouge.
              for (const key of Object.keys(merged) as (keyof Message)[]) {
                if (merged[key] !== existing[key]) {
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

      setUsers: (users) => set({ users }),

      // ── Calculé ──────────────────────────────────────────────────────────────

      getActiveConversation: () => {
        const { conversationById, activeConversationId } = get();
        return activeConversationId ? (conversationById[activeConversationId] ?? null) : null;
      },
    }),
    {
      name: "oc-whatsapp",
      storage: createJSONStorage(() => AsyncStorage),
      // Le web garde le filtre de statut et les filtres de la liste dans l'URL,
      // donc un rechargement les restitue. Sans URL à recharger, le mobile les
      // persiste pour offrir le même comportement d'une session à l'autre.
      partialize: (s) => ({
        selectedSenderId: s.selectedSenderId,
        filter: s.filter,
        filters: s.filters,
      }),
      // Le choix par défaut d'un expéditeur attend cette relecture : sans ça,
      // une liste d'expéditeurs arrivée avant la réhydratation écraserait la
      // sélection mémorisée par le premier de la liste.
      onRehydrateStorage: () => () => {
        useWhatsAppStore.setState({ hydrated: true });
      },
    },
  ),
);
