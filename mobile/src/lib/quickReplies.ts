import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Réponses rapides — portage de `src/shared/db/quickReplies.ts` du web.
 *
 * Le web les garde dans IndexedDB ; côté mobile elles vivent dans AsyncStorage,
 * sous une seule clé : la liste est courte (quelques dizaines d'entrées écrites
 * à la main) et tout écran qui l'affiche en a besoin en entier, donc un
 * document unique évite une API de stockage clé par clé pour rien.
 *
 * Elles restent **locales à l'appareil** : le backend n'expose aucun endpoint
 * de réponses rapides, exactement comme sur le web.
 */

const STORAGE_KEY = "oc-quick-replies";

export interface QuickReply {
  id: string;
  /** Tapé après la barre oblique, en minuscules et sans espace. */
  shortcut: string;
  /** Titre lisible facultatif, affiché à côté du raccourci dans le menu. */
  label?: string;
  /** Le texte inséré dans le composeur. */
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** Forme acceptée (et produite) par les boutons d'import / export. */
export interface QuickReplyFile {
  version: 1;
  exportedAt?: string;
  quickReplies: Array<Pick<QuickReply, "shortcut" | "content"> & { label?: string }>;
}

/** Normalise ce que l'utilisateur a tapé en un raccourci utilisable. */
export function normaliseShortcut(raw: string): string {
  return raw
    .trim()
    .replace(/^\/+/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function newId(): string {
  return `qr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Construit un enregistrement à partir des champs bruts, raccourci normalisé. */
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

export async function listQuickReplies(): Promise<QuickReply[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Tri par raccourci : c'est l'ordre dans lequel le menu les propose.
    return (parsed as QuickReply[]).sort((a, b) => a.shortcut.localeCompare(b.shortcut));
  } catch {
    // Contenu illisible (écriture interrompue, édition manuelle) : on repart
    // d'une liste vide plutôt que de faire échouer tous les écrans.
    return [];
  }
}

async function writeAll(replies: QuickReply[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
}

export async function putQuickReply(reply: QuickReply): Promise<void> {
  const all = await listQuickReplies();
  const index = all.findIndex((r) => r.id === reply.id);
  if (index >= 0) all[index] = reply;
  else all.push(reply);
  await writeAll(all);
}

export async function putManyQuickReplies(replies: QuickReply[]): Promise<void> {
  const all = await listQuickReplies();
  const byId = new Map(all.map((r) => [r.id, r]));
  for (const reply of replies) byId.set(reply.id, reply);
  await writeAll([...byId.values()]);
}

export async function deleteQuickReply(id: string): Promise<void> {
  const all = await listQuickReplies();
  await writeAll(all.filter((r) => r.id !== id));
}

/**
 * Réponses correspondant à ce qui a été tapé après la barre oblique.
 *
 * Les préfixes d'abord — taper `/re` doit tomber sur `/reabo` avant une réponse
 * qui ne fait que mentionner le mot — puis tout ce qui contient la requête.
 */
export function matchQuickReplies(replies: QuickReply[], query: string): QuickReply[] {
  const q = query.trim().toLowerCase();
  if (!q) return replies;

  const prefix: QuickReply[] = [];
  const rest: QuickReply[] = [];
  for (const reply of replies) {
    const haystack = `${reply.shortcut} ${reply.label ?? ""}`.toLowerCase();
    if (reply.shortcut.startsWith(q)) prefix.push(reply);
    else if (haystack.includes(q)) rest.push(reply);
  }
  return [...prefix, ...rest];
}

/** Le `/raccourci` en cours de saisie au niveau du curseur, s'il y en a un. */
export interface SlashToken {
  query: string;
  start: number;
  end: number;
}

/**
 * Ancré au début du message ou à un blanc, pour qu'une barre oblique dans une
 * URL (`https://…`) ou une date n'ouvre jamais la palette.
 */
export function readSlashToken(text: string, caret: number): SlashToken | null {
  const match = /(?:^|\s)\/([^\s/]*)$/.exec(text.slice(0, caret));
  if (!match) return null;
  const query = match[1];
  return { query, start: caret - query.length - 1, end: caret };
}
