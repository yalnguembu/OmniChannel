/**
 * Modèles de l'inbox WhatsApp — portage de `src/models/whatsapp.models.ts` du web.
 *
 * Comme sur le web, les DTO ne sont **pas** validés strictement : le backend
 * renvoie des enums libres (statuts, types de message) et rejeter une valeur
 * inconnue ferait disparaître des messages. On garde donc des types TS et des
 * `string` larges, et on normalise (uppercase) au moment de l'affichage.
 */

export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type Filter = 'ALL' | 'OPEN' | 'PENDING' | 'RESOLVED' | 'UNREAD';

export interface Media {
  id: string;
  mediaType?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  caption?: string | null;
  internalStorageUrl?: string | null;
}

export interface Message {
  id: string;
  conversationId?: string | null;
  externalMessageId?: string | null;
  direction?: string | null;
  messageType?: string | null;
  status?: string | null;
  content?: string | null;
  subject?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  createdAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  sentByName?: string | null;
  sentByUserFirstName?: string | null;
  sentByUserLastName?: string | null;
  replyToMessageId?: string | null;
  replyToMessageContent?: string | null;
  medias?: Media[] | null;
}

export interface Conversation {
  id: string;
  contactAddress?: string | null;
  contactName?: string | null;
  status?: string | null;
  channelName?: string | null;
  channelCode?: string | null;
  senderName?: string | null;
  senderAddress?: string | null;
  lastMessageAt?: string | null;
  lastMessageContent?: string | null;
  lastMessageSubject?: string | null;
  lastMessageMessageType?: string | null;
  lastMessageDirection?: string | null;
  unreadCount?: number | null;
  assignedToUserId?: string | null;
  assignedToUserFirstName?: string | null;
  assignedToUserLastName?: string | null;
  createdAt?: string | null;
}

export interface Stats {
  open?: number;
  pending?: number;
  resolved?: number;
  closed?: number;
  totalUnread?: number;
}

export interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export interface Sender {
  id: string;
  senderName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const AV_COLORS = [
  '#1565c0', '#2e7d32', '#c62828', '#6a1b9a',
  '#00838f', '#558b2f', '#4527a0', '#ad1457',
  '#e65100', '#37474f',
] as const;

export function avatarColor(id: string): string {
  if (!id) return '#607d8b';
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length];
}

export function getInitials(s: string): string {
  const parts = (s || '').replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (s?.[0] || '?').toUpperCase();
}

/**
 * L'API sérialise les dates en datetime naïf (sans 'Z' ni offset) alors que
 * l'instant est en UTC. Sans désignateur, `new Date(...)` interprète la chaîne
 * en heure locale et décale tout de l'offset du téléphone. On ajoute donc 'Z'
 * quand il manque.
 */
export function toUtcDate(dt: string): Date {
  const hasDesignator = /Z$|[+-]\d{2}:?\d{2}$/.test(dt);
  return new Date(hasDesignator ? dt : `${dt}Z`);
}

/**
 * Différence en jours **calendaires locaux** (0 = aujourd'hui, 1 = hier…).
 * Toutes les dates du chat (heures des bulles ET séparateurs de jour) passent
 * par là afin de rester cohérentes entre elles.
 */
export function localDayDiff(dt: string): number {
  const d = toUtcDate(dt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((startOfToday.getTime() - startOfMsgDay.getTime()) / 86400000);
}

export function fmtTime(dt: string | null | undefined): string {
  if (!dt) return '';
  const d = toUtcDate(dt);
  const dayDiff = localDayDiff(dt);
  if (dayDiff <= 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (dayDiff === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function fmtTimeFull(dt: string | null | undefined): string {
  if (!dt) return 'N/A';
  return toUtcDate(dt).toLocaleString('fr-FR');
}

export function fmtTimeShort(dt: string | null | undefined): string {
  if (!dt) return '';
  return toUtcDate(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function convPreview(c: Conversation): string {
  const t = (c.lastMessageMessageType || '').toUpperCase();
  // Les types média affichent une icône en tête de ligne : on ne renvoie ici
  // qu'un libellé neutre (pas d'emoji).
  if (t === 'IMAGE') return 'Photo';
  if (t === 'VIDEO') return 'Vidéo';
  if (t === 'AUDIO') return 'Audio';
  if (t === 'DOCUMENT') return 'Document';
  if (t === 'CONTACT' || t === 'CONTACTS') return 'Contact';
  const content = c.lastMessageContent || c.lastMessageSubject || '';
  // Filet de sécurité : même payload JSON de carte de visite que les messages,
  // au cas où `lastMessageMessageType` ne corresponde pas à nos variantes.
  if (/^\s*\[?\s*\{\s*"name"\s*:/.test(content)) return 'Contact';
  return content;
}

/** Fenêtre de service client WhatsApp : 24h après le dernier message entrant. */
export const SESSION_WINDOW_MS = 24 * 60 * 60 * 1000;
