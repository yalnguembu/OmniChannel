import { create } from "zustand";
import {
  deleteQuickReply,
  listQuickReplies,
  makeQuickReply,
  putManyQuickReplies,
  putQuickReply,
  type QuickReply,
} from "@/lib/quickReplies";

interface QuickReplyState {
  replies: QuickReply[];
  isLoaded: boolean;
  /** Renseigné quand le stockage local est indisponible. */
  error: string | null;

  /** Lit le stockage une fois ; appelable depuis plusieurs composants. */
  hydrate: () => Promise<void>;
  save: (
    input: { shortcut: string; content: string; label?: string },
    existing?: QuickReply,
  ) => Promise<QuickReply | null>;
  remove: (id: string) => Promise<void>;
  /** Upsert par raccourci — un import écrase les entrées de même nom. */
  importMany: (
    entries: Array<{ shortcut: string; content: string; label?: string }>,
  ) => Promise<number>;
}

const STORAGE_ERROR = "Les réponses rapides n'ont pas pu être ouvertes (stockage indisponible).";

/**
 * Les réponses rapides vivent sur l'appareil : un store simple au-dessus
 * d'AsyncStorage plutôt que React Query — plusieurs surfaces (le menu du
 * composeur et l'écran de gestion) doivent voir la même liste dès que l'une
 * d'elles écrit. Portage de `useQuickReplyStore.ts` du web.
 */
export const useQuickReplyStore = create<QuickReplyState>()((set, get) => {
  let hydrating: Promise<void> | null = null;

  const refresh = async () => {
    const replies = await listQuickReplies();
    set({ replies, isLoaded: true, error: null });
  };

  return {
    replies: [],
    isLoaded: false,
    error: null,

    hydrate: () => {
      if (get().isLoaded) return Promise.resolve();
      // On fusionne les appels concurrents — le composeur et l'écran de gestion
      // se montent à peu près en même temps.
      hydrating ??= refresh()
        .catch(() => set({ isLoaded: true, error: STORAGE_ERROR }))
        .finally(() => {
          hydrating = null;
        });
      return hydrating;
    },

    save: async (input, existing) => {
      const reply = makeQuickReply(input, existing);
      if (!reply.shortcut || !reply.content.trim()) return null;
      try {
        await putQuickReply(reply);
        await refresh();
        return reply;
      } catch {
        set({ error: STORAGE_ERROR });
        return null;
      }
    },

    remove: async (id) => {
      try {
        await deleteQuickReply(id);
        await refresh();
      } catch {
        set({ error: STORAGE_ERROR });
      }
    },

    importMany: async (entries) => {
      const bySlug = new Map(get().replies.map((r) => [r.shortcut, r]));
      const records = entries.map((entry) => makeQuickReply(entry, bySlug.get(entry.shortcut)));
      try {
        await putManyQuickReplies(records);
        await refresh();
        return records.length;
      } catch {
        set({ error: STORAGE_ERROR });
        return 0;
      }
    },
  };
});
