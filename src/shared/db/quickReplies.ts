/**
 * Quick replies — canned messages an agent inserts by typing `/shortcut`.
 *
 * Stored on the device rather than on the server: they are per-agent
 * shortcuts, the API has no endpoint for them, and they must stay available
 * instantly while typing. Sharing between agents goes through the JSON
 * import/export below.
 *
 * **They live in `localStorage`, not IndexedDB.** IndexedDB is best-effort
 * storage: an installed PWA can have it evicted by the browser without
 * warning, which is how agents lost replies they had typed by hand — and there
 * is no server copy to restore them from. `localStorage` is the same kind of
 * quota in the letter of the spec, but browsers treat it far more
 * conservatively in practice, and the whole set is a few kilobytes read in one
 * go by every screen that shows it, so a key-by-key store bought nothing.
 *
 * The API stays asynchronous even though `localStorage` is not: callers were
 * written against the database and have no reason to change, and it leaves the
 * door open to a server-side store later.
 */

export interface QuickReply {
  id: string;
  /** Typed after the slash, lowercase and space-free. */
  shortcut: string;
  /** Optional human title shown in the menu next to the shortcut. */
  label?: string;
  /** The text inserted in the composer. */
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** The shape accepted (and produced) by the import/export buttons. */
export interface QuickReplyFile {
  version: 1;
  exportedAt?: string;
  quickReplies: Array<Pick<QuickReply, 'shortcut' | 'content'> & { label?: string }>;
}

const STORAGE_KEY = 'oc-quick-replies';
/** Read once to migrate anything left in the previous IndexedDB store. */
const LEGACY_DB_NAME = 'omnichannel';
const LEGACY_STORE = 'quickReplies';

/** Normalises what the user typed into a usable shortcut token. */
export function normaliseShortcut(raw: string): string {
  return raw
    .trim()
    .replace(/^\/+/, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/** Anything unreadable is treated as an empty set rather than thrown. */
function readAll(): QuickReply[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QuickReply[]) : [];
  } catch {
    return [];
  }
}

function writeAll(replies: QuickReply[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
}

/**
 * Moves whatever the old IndexedDB store still holds into `localStorage`.
 *
 * Runs once per page load, and only when `localStorage` is empty: switching
 * store must not be the thing that finally loses the replies an agent still
 * had. Entries already present win, so a migration can never overwrite newer
 * work. Failures are silent — the old store may well be the one the browser
 * evicted in the first place.
 */
let migrated = false;
async function migrateLegacyStore(): Promise<QuickReply[]> {
  if (migrated) return [];
  migrated = true;

  if (typeof indexedDB === 'undefined') return [];
  try {
    const legacy = await new Promise<QuickReply[]>((resolve) => {
      const request = indexedDB.open(LEGACY_DB_NAME);
      request.onerror = () => resolve([]);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(LEGACY_STORE)) {
          db.close();
          resolve([]);
          return;
        }
        const tx = db.transaction(LEGACY_STORE, 'readonly');
        const all = tx.objectStore(LEGACY_STORE).getAll();
        all.onsuccess = () => resolve((all.result ?? []) as QuickReply[]);
        all.onerror = () => resolve([]);
        tx.oncomplete = () => db.close();
      };
    });

    if (legacy.length === 0) return [];
    writeAll(legacy);
    return legacy;
  } catch {
    return [];
  }
}

export async function listQuickReplies(): Promise<QuickReply[]> {
  let all = readAll();
  if (all.length === 0) all = await migrateLegacyStore();
  return all.sort((a, b) => a.shortcut.localeCompare(b.shortcut, 'fr'));
}

export async function putQuickReply(reply: QuickReply): Promise<void> {
  const all = readAll().filter((r) => r.id !== reply.id);
  writeAll([...all, reply]);
}

export async function deleteQuickReply(id: string): Promise<void> {
  writeAll(readAll().filter((r) => r.id !== id));
}

export async function putManyQuickReplies(replies: QuickReply[]): Promise<void> {
  if (replies.length === 0) return;
  const incoming = new Map(replies.map((r) => [r.id, r]));
  const kept = readAll().filter((r) => !incoming.has(r.id));
  writeAll([...kept, ...replies]);
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `qr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Builds a record from raw field values, normalising the shortcut. */
export function makeQuickReply(
  input: { shortcut: string; content: string; label?: string },
  existing?: QuickReply,
): QuickReply {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? newId(),
    shortcut: normaliseShortcut(input.shortcut),
    label: input.label?.trim() || undefined,
    content: input.content,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

// ─── Import / export ─────────────────────────────────────────────────────────

export interface ParseResult {
  /** Entries that were valid, ready to be stored. */
  valid: Array<{ shortcut: string; content: string; label?: string }>;
  /** One line per rejected entry, explaining why. */
  errors: string[];
}

/**
 * Reads an import file. Accepts the documented envelope
 * (`{ version, quickReplies: [...] }`) as well as a bare array, since that is
 * what people produce by hand.
 */
export function parseQuickReplyFile(raw: string): ParseResult {
  const result: ParseResult = { valid: [], errors: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    result.errors.push("Le fichier n'est pas du JSON valide.");
    return result;
  }

  const entries = Array.isArray(parsed)
    ? parsed
    : (parsed as { quickReplies?: unknown })?.quickReplies;

  if (!Array.isArray(entries)) {
    result.errors.push(
      'Format attendu : un tableau, ou un objet avec une clé "quickReplies".',
    );
    return result;
  }

  const seen = new Set<string>();
  entries.forEach((entry, index) => {
    const row = entry as Record<string, unknown>;
    const position = `Entrée ${index + 1}`;
    const shortcut = normaliseShortcut(String(row?.shortcut ?? row?.raccourci ?? ''));
    const content = String(row?.content ?? row?.message ?? row?.texte ?? '').trim();

    if (!shortcut) {
      result.errors.push(`${position} : "shortcut" manquant.`);
      return;
    }
    if (!content) {
      result.errors.push(`${position} (/${shortcut}) : "content" manquant.`);
      return;
    }
    if (seen.has(shortcut)) {
      result.errors.push(`${position} : /${shortcut} en double dans le fichier.`);
      return;
    }
    seen.add(shortcut);

    const label = row?.label ?? row?.titre;
    result.valid.push({
      shortcut,
      content,
      label: label ? String(label).trim() : undefined,
    });
  });

  return result;
}

export function toQuickReplyFile(replies: QuickReply[]): QuickReplyFile {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    quickReplies: replies.map(({ shortcut, label, content }) => ({
      shortcut,
      ...(label ? { label } : {}),
      content,
    })),
  };
}

/** Example shown in the import panel so the expected shape is unambiguous. */
export const QUICK_REPLY_FILE_EXAMPLE = `{
  "version": 1,
  "quickReplies": [
    {
      "shortcut": "merci",
      "label": "Remerciement",
      "content": "Merci pour votre message, nous revenons vers vous rapidement."
    },
    {
      "shortcut": "reabo",
      "label": "Lien de réabonnement",
      "content": "Voici votre lien de réabonnement : https://app.myreabo.cm/pay"
    }
  ]
}`;
