import { z } from "zod";

/**
 * ReaboCanal (fujisat) models.
 *
 * The OpenAPI spec types `POST /User/login` as `200: unknown`, so nothing in
 * the generated SDK describes what comes back. These schemas are the contract:
 * they are written against the shape ReaboCanal's own `AuthPersistence` reads
 * (`token`, `tokenExpiresUtc`, `refreshToken`, `refreshTokenExpiresUtc`,
 * `permissions`, …) and stay lenient — an unknown extra field must never make
 * a successful login look like a failure.
 */

// ─── Session ─────────────────────────────────────────────────────────────────

export const ReaboSessionSchema = z
  .object({
    token: z.string().optional().nullable(),
    tokenExpiresUtc: z.string().optional().nullable(),
    refreshToken: z.string().optional().nullable(),
    refreshTokenExpiresUtc: z.string().optional().nullable(),
    permissions: z.array(z.string()).optional().nullable(),

    // `admin-web`'s login page reads the expiry as
    // `tokenExpiresUtc ?? tokenExpirationDate`, so both spellings exist in the
    // wild; the rest are defensive, the login response being typed `unknown`.
    tokenExpirationDate: z.string().optional().nullable(),
    accessToken: z.string().optional().nullable(),
    refresh_token: z.string().optional().nullable(),
    expiresUtc: z.string().optional().nullable(),
    tokenExpiration: z.string().optional().nullable(),

    // The login payload already carries the balances and the entity type —
    // `admin-web` seeds its whole session from it without a single follow-up
    // call.
    operationBalance: z.union([z.number(), z.string()]).optional().nullable(),
    commissionBalance: z.union([z.number(), z.string()]).optional().nullable(),
    entityType: z.string().optional().nullable(),

    id: z.union([z.string(), z.number()]).optional().nullable(),
    userName: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    // Not a typo — the API spells it `fristName` in several DTOs.
    fristName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    profilName: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
    distributorId: z.union([z.string(), z.number()]).optional().nullable(),
  })
  .passthrough();
export type ReaboSession = z.infer<typeof ReaboSessionSchema>;

/**
 * Whether an access token has run out, with a safety margin.
 *
 * `tokenExpiresUtc` comes back as a UTC instant written without a designator,
 * so a `Z` is appended before parsing — otherwise the browser reads it as local
 * time and the token looks valid for another hour in Douala.
 *
 * A missing or unparseable date counts as **valid**, matching ReaboCanal's own
 * `TokenManager.isTokenExpired`: its date comparison yields `false` on an
 * `Invalid Date`, so a session whose expiry the API did not return keeps
 * working and the server rules on it with a 401. Treating the unknown as
 * expired instead is what made a perfectly good login show up as "session
 * expirée" the moment it was stored.
 */
export function isTokenExpired(iso: string | null | undefined, skewMs = 0): boolean {
  if (!iso) return false;
  const normalised = /Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const at = new Date(normalised);
  if (Number.isNaN(at.getTime())) return false;
  return at.getTime() - skewMs <= Date.now();
}

/** What the status pill shows — derived from the session, never fetched. */
export interface ReaboAccount {
  name: string;
  userName: string;
  profil: string;
  distributorId: string;
}

export function toReaboAccount(session: ReaboSession): ReaboAccount {
  const first = session.firstName || session.fristName || "";
  const last = session.lastName || "";
  const name = `${first} ${last}`.trim();
  return {
    name: name || session.userName || "Compte Reabo",
    userName: session.userName || "",
    profil: session.profilName || session.role || "",
    distributorId:
      session.distributorId != null ? String(session.distributorId) : "",
  };
}

/**
 * Parses a login payload, returning null when it carries no usable token —
 * the API answers `code: 0` on a successful call whose body is still not a
 * session (wrong shape, partial account), and that must read as a failure.
 */
/**
 * Pulls the session out of a login response.
 *
 * `admin-web` reads it as `response.data ?? response` and then simply checks
 * for a `token` — it never inspects an envelope code on this endpoint. The
 * same shape-tolerance is reproduced here: the payload is looked for at the
 * top level and one level down, because both forms exist depending on the
 * endpoint.
 */
export function parseReaboSession(raw: unknown): ReaboSession | null {
  const candidates = [raw, (raw as { data?: unknown })?.data];

  for (const candidate of candidates) {
    const parsed = ReaboSessionSchema.safeParse(candidate);
    if (!parsed.success) continue;

    // Normalise the aliases onto the canonical fields, so nothing downstream
    // has to know which spelling this deployment happens to use.
    const s = parsed.data;
    const session: ReaboSession = {
      ...s,
      token: s.token || s.accessToken || null,
      refreshToken: s.refreshToken || s.refresh_token || null,
      tokenExpiresUtc:
        s.tokenExpiresUtc ||
        s.tokenExpirationDate ||
        s.expiresUtc ||
        s.tokenExpiration ||
        null,
    };
    if (session.token) return session;
  }

  return null;
}

/**
 * Login failures come back as a **negative** `code` on the response envelope,
 * not as an HTTP error — the same catalogue `admin-web` switches on to decide
 * which dialog to show.
 */
export const REABO_LOGIN_ERRORS: Record<number, string> = {
  [-1]: "Identifiant ou mot de passe incorrect.",
  [-2]: "Ce compte est désactivé.",
  [-3]: "Ce compte est bloqué après trop de tentatives.",
  [-4]: "Ce compte n'est pas encore approuvé.",
  [-5]: "Le mot de passe doit être réinitialisé avant de pouvoir se connecter.",
  [-6]: "Ce compte n'est pas vérifié.",
  [-7]: "Le mot de passe doit être modifié avant de pouvoir se connecter.",
};

export function reaboLoginError(code: unknown, message?: unknown): string {
  if (typeof code === "number" && REABO_LOGIN_ERRORS[code]) {
    return REABO_LOGIN_ERRORS[code];
  }
  if (typeof message === "string" && message.trim()) return message;
  return REABO_LOGIN_ERRORS[-1];
}

/** Balances as the login payload carries them, whatever their wire type. */
export function sessionBalances(session: ReaboSession): {
  operations: number | null;
  commissions: number | null;
} {
  const toNumber = (v: unknown): number | null => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    operations: toNumber(session.operationBalance),
    commissions: toNumber(session.commissionBalance),
  };
}

// ─── Solde ───────────────────────────────────────────────────────────────────

export const ReaboSoldeSchema = z
  .object({
    soldeOperations: z.number().optional().nullable(),
    soldeCommissions: z.number().optional().nullable(),
    soldeType: z.string().optional().nullable(),
  })
  .passthrough();
export type ReaboSolde = z.infer<typeof ReaboSoldeSchema>;

export function parseReaboSolde(raw: unknown): ReaboSolde | null {
  const parsed = ReaboSoldeSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/** `96000` → `96 000 FCFA`. Narrow no-break spaces keep the amount on one line. */
export function fmtFcfa(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${Math.round(amount).toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;
}

// ─── Abonné (résultat de recherche) ──────────────────────────────────────────

/**
 * One row of `GET /mypos/search-subscriber-user/{attr}`.
 *
 * Only two of these fields are structural: `numabo` and **`cabo`**. The detail
 * endpoints take `{numabo}/{subscriptionNumber}` in their path, and ReaboCanal's
 * own `admin-web` feeds that second slot with `cabo` — not with the
 * `subscriptionNumber` field of this very DTO. Search is therefore the only
 * source of the key that opens a subscription, which is why nothing here can be
 * reached without it.
 */
export const SubscriberSchema = z
  .object({
    numabo: z.string().optional().nullable(),
    cabo: z.string().optional().nullable(),
    nomabo: z.string().optional().nullable(),
    prenomabo: z.string().optional().nullable(),
    paysabo: z.string().optional().nullable(),
    villabo: z.string().optional().nullable(),
    adresseabo: z.string().optional().nullable(),
    optionmajeureabo: z.string().optional().nullable(),
    subscriptionNumber: z.number().optional().nullable(),
    telephoneabo: z.string().optional().nullable(),
    debabo: z.string().optional().nullable(),
    finabo: z.string().optional().nullable(),
    activityLabel: z.string().optional().nullable(),
  })
  .passthrough();
export type Subscriber = z.infer<typeof SubscriberSchema>;

export function parseSubscribers(raw: unknown): Subscriber[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((row) => {
    const parsed = SubscriberSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}

/** Full name as the agent reads it, never an empty string. */
export function subscriberName(s: Subscriber): string {
  const name = `${s.nomabo ?? ""} ${s.prenomabo ?? ""}`.trim();
  return name || s.numabo || "Abonné";
}

/**
 * The path pair every subscription call needs. Returns null when the row is
 * unusable — a subscriber without `cabo` cannot be opened, and asking anyway
 * would 404.
 */
export function subscriptionKey(
  s: Subscriber,
): { numabo: number; subscriptionNumber: number } | null {
  const numabo = Number.parseInt(s.numabo ?? "", 10);
  const subscriptionNumber = Number.parseInt(s.cabo ?? "", 10);
  if (!numabo || !subscriptionNumber) return null;
  return { numabo, subscriptionNumber };
}

// ─── Détails d'abonnement ────────────────────────────────────────────────────

export const ReaboOptionSchema = z
  .object({
    codeOption: z.string().optional().nullable(),
    descriptionOption: z.string().optional().nullable(),
    priceOption: z.number().optional().nullable(),
  })
  .passthrough();
export type ReaboOption = z.infer<typeof ReaboOptionSchema>;

export const ReaboOffreSchema = z
  .object({
    code: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    price: z.number().optional().nullable(),
    options: z.array(ReaboOptionSchema).optional().nullable().default([]),
  })
  .passthrough();
export type ReaboOffre = z.infer<typeof ReaboOffreSchema>;

export const ReaboDureeSchema = z
  .object({
    value: z.number().optional().nullable(),
    description: z.string().optional().nullable(),
  })
  .passthrough();
export type ReaboDuree = z.infer<typeof ReaboDureeSchema>;

/**
 * `GET /mypos/details-resubscribing/{numabo}/{cabo}`.
 *
 * Deliberately the variant **without** `-user`: the `-user` one answers with an
 * empty `telephoneAbonne`, which made admin-web warn "numéro non à jour" on
 * every subscriber. It also carries the whole catalogue — offers, durations,
 * promotions — so the réabo wizard needs no second call.
 */
export const SubscriptionDetailsSchema = z
  .object({
    numdecabo: z.string().optional().nullable(),
    numeroContrat: z.number().optional().nullable(),
    numabo: z.string().optional().nullable(),
    nomabo: z.string().optional().nullable(),
    prenomabo: z.string().optional().nullable(),
    telephoneAbonne: z.string().optional().nullable(),
    subscriptionNumber: z.number().optional().nullable(),
    numdistLC: z.string().optional().nullable(),
    nomdistLC: z.string().optional().nullable(),
    cactiviteLC: z.string().optional().nullable(),
    activiteLC: z.string().optional().nullable(),
    offreCodeLC: z.string().optional().nullable(),
    offreLibelleLC: z.string().optional().nullable(),
    dateDebutLC: z.string().optional().nullable(),
    dateFinLC: z.string().optional().nullable(),
    demandeLeLC: z.string().optional().nullable(),
    dateDebutReabo: z.string().optional().nullable(),
    dateFinReabo: z.string().optional().nullable(),
    offres: z.array(ReaboOffreSchema).optional().nullable().default([]),
    durees: z.array(ReaboDureeSchema).optional().nullable().default([]),
    promotions: z.array(z.unknown()).optional().nullable().default([]),
  })
  .passthrough();
export type SubscriptionDetails = z.infer<typeof SubscriptionDetailsSchema>;

export function parseSubscriptionDetails(
  raw: unknown,
): SubscriptionDetails | null {
  const parsed = SubscriptionDetailsSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

// ─── Transactions ────────────────────────────────────────────────────────────

/**
 * One row of `GET /transaction/get-last-operations/{numdec}`.
 *
 * The list is self-sufficient: status, articles, amount, payer, provider
 * references and the customer's own subscription dates all travel with each
 * row, so a "detail" view is an expanded row rather than a second request.
 */
export const OperationSchema = z
  .object({
    /** Present on the paged view only — what `verify` and the receipt need. */
    operId: z.number().optional().nullable(),
    transId: z.number().optional().nullable(),
    operUpdateDate: z.string().optional().nullable(),
    usersFullName: z.string().optional().nullable(),
    distName: z.string().optional().nullable(),
    distNumCanal: z.string().optional().nullable(),
    transGuid: z.string().optional().nullable(),
    transProviderDate: z.string().optional().nullable(),
    custEmail: z.string().optional().nullable(),
    custAddress: z.string().optional().nullable(),
    operStatut: z.string().optional().nullable(),
    operArticles: z.string().optional().nullable(),
    operAmount: z.number().optional().nullable(),
    operOperationType: z.string().optional().nullable(),
    operCreateDate: z.string().optional().nullable(),
    operNumDecoder: z.string().optional().nullable(),
    operNumContrat: z.number().optional().nullable(),
    operNumAbo: z.string().optional().nullable(),
    transTelephonePayeur: z.string().optional().nullable(),
    transReferenceInterne: z.string().optional().nullable(),
    transMessageProvider: z.string().optional().nullable(),
    transReferenceProvider: z.string().optional().nullable(),
    transStaut: z.string().optional().nullable(),
    transFees: z.number().optional().nullable(),
    transPaymentMethod: z.string().optional().nullable(),
    transAmount: z.number().optional().nullable(),
    transType: z.string().optional().nullable(),
    custFullName: z.string().optional().nullable(),
    custStartDateAbo: z.string().optional().nullable(),
    custEndDateAbo: z.string().optional().nullable(),
    custPhoneNumber: z.string().optional().nullable(),
  })
  .passthrough();
export type Operation = z.infer<typeof OperationSchema>;

export function parseOperations(raw: unknown): Operation[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((row) => {
    const parsed = OperationSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}

/** What the agent can do with a row depends on which of these it is. */
export type OperationStatus = "success" | "failed" | "draft";

/** Accent- and case-insensitive, so `Réussi` and `REUSSIT` land together. */
function fold(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

/**
 * Buckets the free-text status the API returns.
 *
 * The label shown to the agent stays the API's own wording — it is the truth,
 * and paraphrasing it would hide a state we had not anticipated. Only the
 * colour and the available actions are derived, and an unrecognised status
 * falls back to `draft`: neutral, and no destructive action offered.
 */
export function operationStatus(op: Operation): OperationStatus {
  const text = `${fold(op.operStatut)} ${fold(op.transStaut)}`;
  if (/SUCC|REUSS|PAYE|VALID|TERMIN/.test(text)) return "success";
  if (/ECHEC|FAIL|ANNUL|REJET|REFUS|EXPIR/.test(text)) return "failed";
  return "draft";
}

/** French label for the bucket, when the API gives no wording of its own. */
export const OPERATION_STATUS_LABEL: Record<OperationStatus, string> = {
  success: "Réussie",
  failed: "Échec",
  draft: "Brouillon",
};

export function operationStatusLabel(op: Operation): string {
  return (
    (op.operStatut ?? "").trim() ||
    (op.transStaut ?? "").trim() ||
    OPERATION_STATUS_LABEL[operationStatus(op)]
  );
}

// ─── Lien de paiement ────────────────────────────────────────────────────────

/**
 * `POST /mypos/flux-create-pay-link`.
 *
 * The response is untyped in the spec, so this schema is the contract. What
 * matters beyond `payUrl` is the follow-up state: `isUsed`, `isValid` and
 * `expiresAt` are what let the inbox say "sent two hours ago, not paid yet"
 * instead of leaving the agent to wonder.
 */
export const PaymentLinkSchema = z
  .object({
    id: z.number().optional().nullable(),
    linkGuid: z.string().optional().nullable(),
    payUrl: z.string().optional().nullable(),
    numabo: z.string().optional().nullable(),
    subscriptionNumber: z.number().optional().nullable(),
    offreCode: z.string().optional().nullable(),
    options: z.string().optional().nullable(),
    duree: z.number().optional().nullable(),
    montant: z.number().optional().nullable(),
    isUsed: z.boolean().optional().nullable(),
    isValid: z.boolean().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    createDate: z.string().optional().nullable(),
  })
  .passthrough();
export type PaymentLink = z.infer<typeof PaymentLinkSchema>;

export function parsePaymentLink(raw: unknown): PaymentLink | null {
  const parsed = PaymentLinkSchema.safeParse(raw);
  if (!parsed.success) return null;
  return parsed.data.payUrl ? parsed.data : null;
}

/**
 * A price can come back as a bare number, a numeric string, or wrapped in an
 * object by an endpoint the spec types as `unknown`. All three mean the same
 * thing to the agent.
 */
export function parsePrice(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : null;
  }
  if (raw && typeof raw === "object") {
    for (const key of ["montant", "price", "amount", "value"]) {
      const value = (raw as Record<string, unknown>)[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
  }
  return null;
}

// ─── Moyens de paiement ──────────────────────────────────────────────────────

export const PaymentMethodSchema = z
  .object({
    id: z.number().optional().nullable(),
    code: z.union([z.string(), z.number()]).optional().nullable(),
    name: z.string().optional().nullable(),
    activate: z.boolean().optional().nullable(),
  })
  .passthrough();
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export function parsePaymentMethods(raw: unknown): PaymentMethod[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((row) => {
    const parsed = PaymentMethodSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}

/** `methodePaiement` goes out as a number, whatever the catalogue returns. */
export function paymentMethodCode(m: PaymentMethod): number {
  return Number(m.code ?? 0) || 0;
}

// ─── Téléphones ──────────────────────────────────────────────────────────────

/**
 * The payer number as the platform wants it: **9 digits**, no country code.
 *
 * WhatsApp hands conversation addresses in international form
 * (`237657209853`), sometimes with a `+` or a `00` prefix, and admin-web
 * validates the payer field on a length of exactly 9 — so the country code has
 * to come off before the number can be proposed as a default.
 */
export function toLocalPayer(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const withoutIdd = digits.startsWith("00") ? digits.slice(2) : digits;
  const withoutCountry = withoutIdd.startsWith("237")
    ? withoutIdd.slice(3)
    : withoutIdd;
  // Anything longer is not a Cameroonian local number; keep the last 9 rather
  // than guess a different country's plan.
  return withoutCountry.length > 9 ? withoutCountry.slice(-9) : withoutCountry;
}

// ─── Dates ───────────────────────────────────────────────────────────────────

/**
 * ReaboCanal formats subscription dates as `JJ/MM/AAAA`, not ISO — feeding one
 * to `new Date()` yields `Invalid Date`, which would silently turn every
 * subscription "inactive". Parse the parts by hand, as admin-web does.
 */
export function parseFrDate(value: string | null | undefined): Date | null {
  if (!value || value.length < 10) return null;
  const day = value.slice(0, 2);
  const month = value.slice(3, 5);
  const year = value.slice(6, 10);
  const date = new Date(`${year}-${month}-${day}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ─── Plages de dates des opérations ──────────────────────────────────────────

/**
 * How far back the default transaction range reaches.
 *
 * `get-paged-operation-details` filters on a **strict** interval and
 * `admin-web` defaults it to today 00:00 → today 23:59 — which is why an
 * unbounded call comes back empty. The inbox needs the opposite default: an
 * agent opening a decoder's history wants everything, not today. Five years
 * covers any real subscription history while keeping the query bounded.
 */
const DEFAULT_RANGE_YEARS = 5;

/** `yyyy-mm-dd`, the form a native date input reads and writes. */
function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Default `du` / `au` for a transaction search.
 *
 * `anchor` is the oldest date worth asking about — the conversation's first
 * message, or the subscription's start. When it is unknown or more recent than
 * the floor, the floor wins: a range that starts after an operation hides it,
 * and a hidden payment is what the agent is looking for.
 */
export function defaultOperationRange(anchor?: Date | null): {
  from: string;
  to: string;
} {
  const floor = new Date();
  floor.setFullYear(floor.getFullYear() - DEFAULT_RANGE_YEARS);

  const from = anchor && anchor.getTime() < floor.getTime() ? anchor : floor;
  return { from: toDateInput(from), to: toDateInput(new Date()) };
}

/**
 * Turns the two date inputs into the instants the API expects.
 *
 * The day boundaries are explicit: the start is taken at 00:00 and the end at
 * 23:59:59 local, so "au 14/09" includes the whole of the 14th rather than
 * stopping at its first second — the mistake that makes a search silently miss
 * the very operation of the day the agent is asking about.
 */
export function toOperationRangeIso(from: string, to: string): {
  startDateTime: string;
  endDateTime: string;
} {
  const fallback = defaultOperationRange();
  const start = new Date(`${from || fallback.from}T00:00:00`);
  const end = new Date(`${to || fallback.to}T23:59:59`);
  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
}

/** Active while the end date is today or later — admin-web's own rule. */
export function isSubscriptionActive(finabo: string | null | undefined): boolean {
  const end = parseFrDate(finabo);
  if (!end) return false;
  return new Date() <= end;
}

/** Whole days until the subscription ends; negative once it has lapsed. */
export function daysUntil(finabo: string | null | undefined): number | null {
  const end = parseFrDate(finabo);
  if (!end) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end.getTime() - startOfToday.getTime()) / 86400000);
}

/** Human échéance, e.g. `Expire dans 3 jours` / `Expiré depuis 12 jours`. */
export function expiryLabel(finabo: string | null | undefined): string {
  const days = daysUntil(finabo);
  if (days === null) return "Échéance inconnue";
  if (days === 0) return "Expire aujourd’hui";
  if (days === 1) return "Expire demain";
  if (days > 1) return `Expire dans ${days} jours`;
  if (days === -1) return "Expiré depuis hier";
  return `Expiré depuis ${Math.abs(days)} jours`;
}
