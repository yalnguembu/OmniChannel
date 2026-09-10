/**
 * Quick replies — canned messages an agent inserts by typing `/shortcut`.
 *
 * Stored in IndexedDB rather than on the server: they are per-agent shortcuts,
 * the API has no endpoint for them, and they must stay available instantly
 * while typing. Sharing between agents goes through the JSON import/export
 * below.
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

const DB_NAME = 'omnichannel';
const DB_VERSION = 1;
const STORE = 'quickReplies';

/** Normalises what the user typed into a usable shortcut token. */
export function normaliseShortcut(raw: string): string {
  return raw
    .trim()
    .replace(/^\/+/, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponible'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('shortcut', 'shortcut', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Ouverture IndexedDB refusée'));
  });
}

/** Runs `work` in a transaction and resolves once it has actually committed. */
async function withStore<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = work(tx.objectStore(STORE));
      let result: T | undefined;
      if (request) request.onsuccess = () => (result = request.result);
      // Resolve on `complete`, not on the request: a write is only durable
      // once the transaction commits.
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(tx.error ?? new Error('Transaction annulée'));
      tx.onerror = () => reject(tx.error ?? new Error('Transaction échouée'));
    });
  } finally {
    db.close();
  }
}

export async function listQuickReplies(): Promise<QuickReply[]> {
  const all = await withStore<QuickReply[]>('readonly', (store) => store.getAll());
  return (all ?? []).sort((a, b) => a.shortcut.localeCompare(b.shortcut, 'fr'));
}

export async function putQuickReply(reply: QuickReply): Promise<void> {
  await withStore('readwrite', (store) => store.put(reply));
}

export async function deleteQuickReply(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id));
}

export async function putManyQuickReplies(replies: QuickReply[]): Promise<void> {
  if (replies.length === 0) return;
  // One transaction for the whole batch: an import either lands or it doesn't.
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      for (const reply of replies) store.put(reply);
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new Error('Import annulé'));
      tx.onerror = () => reject(tx.error ?? new Error('Import échoué'));
    });
  } finally {
    db.close();
  }
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
