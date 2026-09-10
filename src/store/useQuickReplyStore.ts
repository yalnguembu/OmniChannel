import { create } from 'zustand';
import {
  deleteQuickReply,
  listQuickReplies,
  makeQuickReply,
  putManyQuickReplies,
  putQuickReply,
  type QuickReply,
} from '@/shared/db/quickReplies';

interface QuickReplyState {
  replies: QuickReply[];
  isLoaded: boolean;
  /** Set when IndexedDB is unavailable (private window, blocked storage). */
  error: string | null;

  /** Reads the store once; safe to call from several components. */
  hydrate: () => Promise<void>;
  save: (
    input: { shortcut: string; content: string; label?: string },
    existing?: QuickReply,
  ) => Promise<QuickReply | null>;
  remove: (id: string) => Promise<void>;
  /** Upserts by shortcut — an import overwrites same-named entries. */
  importMany: (
    entries: Array<{ shortcut: string; content: string; label?: string }>,
  ) => Promise<number>;
}

const STORAGE_ERROR =
  "Les réponses rapides n'ont pas pu être ouvertes (stockage du navigateur indisponible).";

/**
 * Quick replies live in the client, so a plain store over IndexedDB rather
 * than React Query: several surfaces (the composer menu and the management
 * modal) must see the same list update the moment one of them writes.
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
      // Collapse concurrent calls — both the composer and the modal mount at
      // roughly the same time.
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
      const records = entries.map((entry) =>
        makeQuickReply(entry, bySlug.get(entry.shortcut)),
      );
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

/**
 * Replies matching what has been typed after the slash.
 *
 * Prefix matches first — typing `/re` should land on `/reabo` before a reply
 * that merely mentions the word — then anything else containing the query.
 */
export function matchQuickReplies(replies: QuickReply[], query: string): QuickReply[] {
  const q = query.trim().toLowerCase();
  if (!q) return replies;

  const prefix: QuickReply[] = [];
  const rest: QuickReply[] = [];
  for (const reply of replies) {
    const haystack = `${reply.shortcut} ${reply.label ?? ''}`.toLowerCase();
    if (reply.shortcut.startsWith(q)) prefix.push(reply);
    else if (haystack.includes(q)) rest.push(reply);
  }
  return [...prefix, ...rest];
}
