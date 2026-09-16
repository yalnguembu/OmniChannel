/**
 * Endpoints consommés par l'app mobile — un par chemin du contrat de l'API
 * OmniChannel (le chemin exact est indiqué au-dessus de chaque fonction).
 *
 * Le web passe par le SDK hey-api généré ; son inbox WhatsApp appelle déjà
 * `sdk.gen.ts` directement (exception documentée dans CLAUDE.md). Le mobile
 * garde la même exception avec ce module fin : pas de générateur à faire tourner
 * dans le pipeline Expo, et la surface consommée reste volontairement petite.
 */
import { api, unwrapList, unwrapOne, unwrapPaged, type PagedResult } from "./client";
import type {
  Conversation,
  ConversationStatus,
  Message,
  Sender,
  Stats,
  User,
} from "@/models/whatsapp.models";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginBody {
  email: string;
  password: string;
  platform?: string;
  hardwareId?: string;
  screenResolution?: string;
}

export interface LoginUser {
  id?: string;
  email?: string | null;
  fullName?: string | null;
  userType?: string | null;
  companyId?: string | null;
}

export interface LoginResult {
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: LoginUser | null;
  isNewDevice?: boolean;
  requiresPasswordChange?: boolean;
}

/** POST /api/auth/login */
export async function login(body: LoginBody) {
  return unwrapOne<LoginResult>(await api.post("/api/auth/login", body));
}

/** POST /api/auth/logout */
export async function logout() {
  await api.post("/api/auth/logout", {});
}

/** GET /api/User/me — enrichit l'utilisateur « mince » renvoyé par le login. */
export async function getMe() {
  return unwrapOne<Record<string, any>>(await api.get("/api/User/me"));
}

/** POST /api/User/search */
export async function searchUsers() {
  return unwrapList<User>(
    await api.post("/api/User/search", { pageNumber: 1, pageSize: 100 }),
  );
}

// ─── Expéditeurs / templates ──────────────────────────────────────────────────

interface SenderDropdownDto {
  id?: string;
  address?: string | null;
  displayName?: string | null;
}

/** GET /api/Sender/dropdown */
export async function getSenders(): Promise<Sender[]> {
  const items = unwrapList<SenderDropdownDto>(await api.get("/api/Sender/dropdown"));
  return items
    .filter((s): s is SenderDropdownDto & { id: string } => !!s.id)
    .map((s) => ({ id: s.id, senderName: s.displayName || s.address || s.id }));
}

export interface TemplateOption {
  id?: string;
  name?: string | null;
  status?: string | null;
}

/** GET /api/Template/dropdown */
export async function getTemplates() {
  return unwrapList<TemplateOption>(await api.get("/api/Template/dropdown"));
}

export interface Option {
  id: string;
  name?: string | null;
}

/** GET /api/Product/dropdown */
export async function getProducts() {
  return unwrapList<Option>(await api.get("/api/Product/dropdown"));
}

/** POST /api/ClientSegment/search */
export async function searchSegments() {
  return unwrapList<Option>(
    await api.post("/api/ClientSegment/search", { pageNumber: 1, pageSize: 100 }),
  );
}

// ─── Conversations ────────────────────────────────────────────────────────────

export interface ConversationSearchParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  unreadOnly?: boolean;
  searchTerm?: string;
  senderId?: string;
  /** Id de l'agent assigné. */
  assignedToUser?: string;
  /** 'INBOUND' | 'OUTBOUND' — direction du dernier message. */
  lastMessageDirection?: string;
}

/** GET /api/Conversation/search */
export async function searchConversations(query: ConversationSearchParams) {
  return unwrapList<Conversation>(
    await api.get("/api/Conversation/search", { params: query }),
  );
}

/** GET /api/Conversation/detail/{id} */
export async function getConversation(id: string) {
  return unwrapOne<Conversation>(await api.get(`/api/Conversation/detail/${id}`));
}

/** GET /api/Conversation/stats */
export async function getStats() {
  return unwrapOne<Stats>(await api.get("/api/Conversation/stats"));
}

/**
 * GET /api/Conversation/message/search — les `limit` messages les plus récents,
 * en une requête.
 *
 * Toujours la page 1 : sur un fil vivant, une pagination par pages dérive (les
 * messages qui arrivent décalent les bornes, et la page 2 renvoie des lignes
 * que la page 1 avait déjà). Relire les N plus récents ne peut pas dériver, et
 * le store fusionne par id.
 */
export async function fetchMessageWindow(
  conversationId: string,
  limit: number,
): Promise<PagedResult<Message>> {
  return unwrapPaged<Message>(
    await api.get("/api/Conversation/message/search", {
      params: { id: conversationId, pageNumber: 1, pageSize: limit },
    }),
    limit,
  );
}

/** PUT /api/Conversation/status */
export async function updateConversationStatus(id: string, status: ConversationStatus) {
  await api.put("/api/Conversation/status", { id, status });
}

/** PUT /api/Conversation/assign */
export async function assignConversation(id: string, userId: string) {
  await api.put("/api/Conversation/assign", { id, userId });
}

// ─── Envois WhatsApp ──────────────────────────────────────────────────────────

/** Fichier local (galerie, appareil photo, document) prêt pour un multipart RN. */
export interface LocalFile {
  uri: string;
  name: string;
  mimeType: string;
}

/** POST /api/WhatsApp/send/text */
export async function sendText(to: string, body: string, senderId?: string | null) {
  await api.post("/api/WhatsApp/send/text", { to, body, senderId: senderId ?? undefined });
}

/** POST /api/WhatsApp/send/reply */
export async function sendReply(
  to: string,
  body: string,
  replyToExternalMessageId: string,
  senderId?: string | null,
) {
  await api.post("/api/WhatsApp/send/reply", {
    to,
    body,
    replyToExternalMessageId,
    senderId: senderId ?? undefined,
  });
}

/**
 * POST /api/WhatsApp/send/image ou POST /api/WhatsApp/send/document
 *
 * Le backend route par expéditeur (multi-tenant) : `SenderId` est requis.
 * L'endpoint est choisi d'après le vrai type MIME et non d'après le menu utilisé
 * (le sélecteur photos renvoie aussi des vidéos, qui partent en document).
 * On ne fixe jamais `Content-Type` à la main : axios doit poser lui-même la
 * frontière du multipart.
 */
export async function sendMedia(
  to: string,
  file: LocalFile,
  caption?: string,
  senderId?: string | null,
) {
  const form = new FormData();
  form.append("To", to);
  // React Native accepte cette forme d'objet fichier dans un FormData.
  form.append("File", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);
  if (caption) form.append("Caption", caption);
  if (senderId) form.append("SenderId", senderId);

  const path = file.mimeType.startsWith("image/")
    ? "/api/WhatsApp/send/image"
    : "/api/WhatsApp/send/document";

  await api.post(path, form);
}

/** POST /api/WhatsApp/send/flow */
export async function sendFlow(to: string, flowToken: string, senderId?: string | null) {
  await api.post("/api/WhatsApp/send/flow", {
    to,
    flowToken,
    senderId: senderId ?? undefined,
  });
}

/** POST /api/WhatsApp/send/template/client */
export async function sendTemplateToClient(
  templateId: string,
  clientId: string,
  senderId?: string | null,
) {
  return unwrapOne<{ status?: string; error?: string }>(
    await api.post("/api/WhatsApp/send/template/client", {
      templateId,
      clientId,
      senderId: senderId ?? undefined,
    }),
  );
}

/** POST /api/WhatsApp/send/template/segment */
export async function sendTemplateToSegment(
  templateId: string,
  segmentId: string,
  senderId?: string | null,
) {
  return unwrapOne<Record<string, number>>(
    await api.post("/api/WhatsApp/send/template/segment", {
      templateId,
      segmentId,
      senderId: senderId ?? undefined,
    }),
  );
}

/**
 * POST /api/WhatsApp/send/template/file
 *
 * Attention : contrairement à `send/image` / `send/document` (champs `To`,
 * `File`, `SenderId`…), ce multipart attend des noms de champs en minuscules.
 */
export async function sendTemplateFile(params: {
  templateId: string;
  file: LocalFile;
  senderId?: string | null;
  productId?: string;
  mappingOverride?: string;
}) {
  const form = new FormData();
  form.append("file", {
    uri: params.file.uri,
    name: params.file.name,
    type: params.file.mimeType,
  } as unknown as Blob);
  form.append("templateId", params.templateId);
  if (params.senderId) form.append("senderId", params.senderId);
  if (params.productId) form.append("productId", params.productId);
  if (params.mappingOverride) form.append("mappingOverride", params.mappingOverride);

  return unwrapOne<Record<string, number>>(
    await api.post("/api/WhatsApp/send/template/file", form),
  );
}

/**
 * Contact CRM tel que renvoyé par la recherche. La réponse porte déjà **tous**
 * les champs modifiables : c'est ce qui permet de reconstruire un corps de PUT
 * complet sans requête supplémentaire (voir `updateClient`).
 */
export interface ClientSearchResult {
  id: string;
  productId?: string | null;
  externalId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  language?: string | null;
  timezone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  status?: string | null;
  customData?: string | null;
}

/**
 * POST /api/Client/search — résout un numéro en contact CRM.
 *
 * Les filtres texte de la recherche client sont mutuellement exclusifs et il n'y
 * a pas de champ « téléphone » : un numéro se cherche via `searchTerm`.
 */
export async function findClientByPhone(phone: string) {
  return unwrapList<ClientSearchResult>(
    await api.post("/api/Client/search", {
      pageNumber: 1,
      pageSize: 1,
      searchTerm: phone,
    }),
  );
}

/** Champs de contact éditables depuis une discussion. */
export interface ClientBody {
  productId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  status?: string | null;
}

/** Champs conservés à l'identique lors d'une mise à jour partielle. */
const PRESERVED_CLIENT_FIELDS = [
  "externalId",
  "gender",
  "birthDate",
  "language",
  "timezone",
  "address",
  "postalCode",
  "customData",
] as const;

/** POST /api/Client */
export async function createClient(body: ClientBody) {
  await api.post("/api/Client", body);
}

/**
 * PUT /api/Client
 *
 * C'est un **remplacement**, pas un patch : n'envoyer que les champs du
 * formulaire viderait tout le reste de la fiche (adresse, langue, attributs
 * personnalisés…). On repart donc du contact déjà chargé et on applique le
 * formulaire par-dessus.
 */
export async function updateClient(current: ClientSearchResult, body: ClientBody) {
  const preserved: Record<string, unknown> = {};
  for (const key of PRESERVED_CLIENT_FIELDS) {
    const value = current[key];
    if (value !== undefined && value !== null) preserved[key] = value;
  }

  // Une clé absente du formulaire garde sa valeur actuelle ; une chaîne vide est
  // une suppression explicite par l'utilisateur.
  const pick = (fromBody: string | null | undefined, fromCurrent: string | null | undefined) =>
    fromBody !== undefined ? fromBody : (fromCurrent ?? undefined);

  await api.put("/api/Client", {
    ...preserved,
    id: current.id,
    productId: pick(body.productId, current.productId),
    firstName: pick(body.firstName, current.firstName),
    lastName: pick(body.lastName, current.lastName),
    email: pick(body.email, current.email),
    phone: pick(body.phone, current.phone),
    city: pick(body.city, current.city),
    country: pick(body.country, current.country),
    status: pick(body.status, current.status),
  });
}

/**
 * PATCH /api/Client/status/{id} — change le seul statut, sans rejouer la fiche.
 * C'est ce que le web utilise pour un changement de statut isolé.
 */
export async function changeClientStatus(id: string, status: string) {
  await api.patch(`/api/Client/status/${id}`, { status });
}

/** GET /api/Client/statuses */
export async function getClientStatuses() {
  return unwrapList<string>(await api.get("/api/Client/statuses"));
}

/** GET /api/ContactChannel/statuses — vocabulaire de délivrabilité du backend. */
export async function getContactChannelStatuses() {
  return unwrapList<string>(await api.get("/api/ContactChannel/statuses"));
}

/**
 * PATCH /api/ContactChannel/status — statut de délivrabilité d'un canal,
 * identifié par le numéro de téléphone.
 */
export async function changeContactChannelStatus(phoneNumber: string, status: string) {
  await api.patch("/api/ContactChannel/status", { phoneNumber, status });
}
