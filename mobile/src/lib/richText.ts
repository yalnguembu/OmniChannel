/**
 * Détection d'entités dans le corps des messages : liens, e-mails, téléphones.
 * Portage de `src/components/whatsapp/shared/RichText.tsx` du web — la logique
 * est identique, seul le rendu change (voir `RichText.tsx` côté mobile).
 *
 * Les numéros suivent l'**E.164** de l'UIT-T : un numéro international est un
 * `+`, un indicatif pays dont le premier chiffre est 1-9, et au plus 15
 * chiffres en tout. Une expression régulière ne peut pas prouver qu'un numéro
 * est appelable — libphonenumber de Google est la référence pour ça — donc le
 * motif ne fait que proposer des candidats, et {@link isPhoneCandidate}
 * applique ensuite les règles E.164.
 *
 * La règle qui gouverne tout, et celle qui compte dans cette inbox : **une
 * suite de chiffres nue n'est jamais un numéro de téléphone.** Il lui faut un
 * `+`, ou un groupement visible. Les numéros de décodeur, les références de
 * commande et les montants en FCFA sont de longues suites de chiffres et
 * doivent rester du texte brut.
 */

/** Les chiffres seuls — les séparateurs sont cosmétiques dans toutes les notations. */
function digitsOf(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** `12-05-2024` et compagnie sont des dates, pas des numéros à composer. */
const DATE_LIKE = /^\d{1,2}[ -]\d{1,2}[ -]\d{2,4}$|^\d{4}[ -]\d{1,2}[ -]\d{1,2}$/;

type PhoneKind = "intl" | "intl00" | "local";

/**
 * Applique les contraintes E.164 qu'une expression régulière ne sait pas dire.
 *
 * `00` est le préfixe national de sortie internationale (E.123), il ne fait pas
 * partie de l'E.164, et `00` suivi d'une suite de chiffres nue est
 * indiscernable d'un numéro de référence — cette forme n'est donc acceptée que
 * si elle est visiblement groupée.
 */
function isPhoneCandidate(raw: string, kind: PhoneKind): boolean {
  const digits = digitsOf(raw);
  const grouped = /[\s().-]/.test(raw);

  if (kind === "intl") {
    // E.164 : 15 chiffres au maximum, un indicatif pays ne commence jamais par 0.
    return digits.length >= 8 && digits.length <= 15 && digits[0] !== "0";
  }
  if (kind === "intl00") {
    const body = digits.slice(2);
    return grouped && body.length >= 8 && body.length <= 15 && body[0] !== "0";
  }
  // Notation nationale groupée, ex. `6 52 56 56 06` ou `695-457-335`.
  return grouped && digits.length >= 8 && digits.length <= 13 && !DATE_LIKE.test(raw);
}

const PHONE_ALTERNATIVES = [
  // E.164, séparateurs cosmétiques admis.
  String.raw`\+[\d\s().-]{7,22}\d`,
  // International écrit avec le préfixe 00.
  String.raw`00[\d\s().-]{7,22}\d`,
  // National, groupé : au moins trois groupes de 2 à 4 chiffres. Les points
  // sont exclus volontairement — `10.500.000` est un montant.
  String.raw`\d{2,4}(?:[ -]\d{2,4}){2,5}`,
].join("|");

/**
 * Groupes **numérotés**, pas nommés : Hermes accepte la syntaxe `(?<nom>…)`
 * mais ne renseigne pas `match.groups`, si bien que chaque entité retombait
 * silencieusement dans la branche « téléphone » et s'y faisait rejeter —
 * aucun lien n'était cliquable sur l'appareil alors que tout marchait en Node.
 * Les index restent stables : les alternatives de `PHONE_ALTERNATIVES`
 * n'utilisent que des groupes non capturants.
 *
 * 1 = url · 2 = www · 3 = e-mail · 4 = caractère de tête · 5 = téléphone
 */
const ENTITY_RE = new RegExp(
  [
    "(\\b(?:https?|ftp):\\/\\/[^\\s<>\"']+)",
    "(\\bwww\\.[^\\s<>\"']+)",
    "(\\b[\\w.!#$%&*+/=?^`{|}~-]+@[\\w-]+(?:\\.[\\w-]+)+\\b)",
    // Le caractère de tête empêche le candidat de démarrer en milieu de suite
    // sans recourir à un lookbehind (que Hermes ne gère pas) ; il est retiré du
    // résultat plus bas.
    `(^|[^\\d+])(${PHONE_ALTERNATIVES})`,
  ].join("|"),
  "gi",
);

/**
 * Ponctuation qui termine une phrase plutôt que d'appartenir à l'URL.
 * La parenthèse fermante est traitée à part : elle est légitime dans une URL
 * (`…/Test_(page)`), donc seule une parenthèse non appariée est retirée.
 */
const TRAILING = /[.,;:!?»"'\]]+$/;

export interface RichToken {
  kind: "text" | "url" | "email" | "phone";
  text: string;
  href?: string;
}

/** Retire la ponctuation de phrase et les parenthèses non appariées d'une URL. */
function trimUrl(raw: string): string {
  let url = raw.replace(TRAILING, "");
  // Une parenthèse fermante fait partie de l'URL seulement si une ouvrante la précède.
  while (
    url.endsWith(")") &&
    (url.match(/\(/g)?.length ?? 0) < (url.match(/\)/g)?.length ?? 0)
  ) {
    url = url.slice(0, -1);
  }
  return url;
}

export function tokenizeRichText(text: string): RichToken[] {
  const tokens: RichToken[] = [];
  let cursor = 0;

  for (const match of text.matchAll(ENTITY_RE)) {
    const [, url, www, email, lead, phone] = match;
    // L'alternative « téléphone » consomme un caractère de tête pour s'ancrer.
    const start = (match.index ?? 0) + (lead?.length ?? 0);
    let raw = phone ?? match[0];

    let token: RichToken;
    if (url || www) {
      raw = trimUrl(raw);
      if (!raw) continue;
      token = {
        kind: "url",
        text: raw,
        href: www ? `https://${raw}` : raw,
      };
    } else if (email) {
      token = { kind: "email", text: raw, href: `mailto:${raw}` };
    } else {
      const kind: PhoneKind = raw.startsWith("+")
        ? "intl"
        : raw.startsWith("00")
          ? "intl00"
          : "local";
      if (!isPhoneCandidate(raw, kind)) continue;
      token = { kind: "phone", text: raw, href: `tel:${raw.replace(/[^\d+]/g, "")}` };
    }

    if (start > cursor) {
      tokens.push({ kind: "text", text: text.slice(cursor, start) });
    }
    tokens.push(token);
    cursor = start + raw.length;
  }

  if (cursor < text.length) {
    tokens.push({ kind: "text", text: text.slice(cursor) });
  }
  return tokens;
}

/** Première URL http(s) de `text`, normalisée — sert à l'aperçu du composeur. */
export function extractFirstUrl(text: string): string | null {
  for (const token of tokenizeRichText(text)) {
    if (token.kind === "url" && token.href) return token.href;
  }
  return null;
}

/**
 * Décompose une URL pour l'aperçu. Sans `new URL()` : son implémentation est
 * partielle selon les moteurs, et on n'a besoin que de l'hôte et de la forme
 * lisible.
 */
export function describeUrl(url: string): { host: string; icon: string; pretty: string } | null {
  const match = /^(https?:\/\/)([^/?#]+)(.*)$/i.exec(url);
  if (!match) return null;
  const [, scheme, host, rest] = match;
  return {
    host: host.replace(/^www\./, "").replace(/:\d+$/, ""),
    // Le favicon du site lui-même — aucun service tiers dans la boucle.
    icon: `${scheme}${host}/favicon.ico`,
    pretty: `${host}${rest}`,
  };
}
