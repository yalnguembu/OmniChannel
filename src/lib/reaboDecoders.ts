import type { Message } from "@/models/whatsapp.models";

/**
 * Decoder-number detection inside WhatsApp message bodies.
 *
 * A decoder number is a bare run of **13 to 15 digits** (`24520032472241`).
 * That range is deliberately a little wider than the numbers actually in
 * circulation: a candidate costs one lookup and is dropped when it resolves to
 * nothing, whereas a number missed by a too-narrow rule is invisible to the
 * agent.
 *
 * Three exclusions keep the rule honest, and each one is a real case in this
 * inbox:
 *
 * - **Longer runs** — a 16-digit reference is not a decoder that happens to
 *   start with one, so a candidate must not touch another digit on either side.
 * - **`+` prefixed** — an international phone number in that length range is a
 *   phone number.
 * - **`00` prefixed** — `00237` + a 9-digit local number is exactly 14 digits,
 *   and the app itself writes payer numbers that way. Without this, every
 *   quoted phone number would look like a decoder.
 *
 * `RegExp` lookbehind is avoided on purpose: older Safari does not support it,
 * which is also why {@link ../components/whatsapp/shared/RichText} anchors its
 * phone pattern by consuming the preceding character.
 */

/** Leading char is consumed for anchoring, then trimmed off the match. */
const DECODER_RE = /(^|[^\d+])(\d{13,15})(?!\d)/g;

export const DECODER_MIN_DIGITS = 13;
export const DECODER_MAX_DIGITS = 15;

/** True when `value` could be a decoder number on its own. */
export function isDecoderCandidate(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  if (value.length < DECODER_MIN_DIGITS || value.length > DECODER_MAX_DIGITS) {
    return false;
  }
  // `00` + country code: an international phone number, not a decoder.
  return !value.startsWith("00");
}

/** Every distinct decoder candidate in a piece of text, in reading order. */
export function extractDecoderCandidates(text: string | null | undefined): string[] {
  if (!text) return [];
  const found: string[] = [];
  for (const match of text.matchAll(DECODER_RE)) {
    const candidate = match[2];
    if (isDecoderCandidate(candidate) && !found.includes(candidate)) {
      found.push(candidate);
    }
  }
  return found;
}

/**
 * Candidates across a whole thread — message bodies and media captions alike,
 * since a decoder number is as often written under a photo of the screen as in
 * a plain message.
 *
 * Deduplicated, newest message first: the number the conversation is *about*
 * is almost always one of the last ones mentioned, and the agent should not
 * have to scroll a list of every decoder ever discussed to find it.
 */
export function collectDecoderCandidates(messages: Message[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    const sources = [m.content ?? "", ...(m.medias ?? []).map((x) => x.caption ?? "")];
    for (const source of sources) {
      for (const candidate of extractDecoderCandidates(source)) {
        if (!seen.has(candidate)) {
          seen.add(candidate);
          ordered.push(candidate);
        }
      }
    }
  }

  return ordered;
}
