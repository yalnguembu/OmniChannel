import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useReaboEntity } from '@/components/reabo/ReaboEntityContext';

/**
 * Entity detection for message bodies: links, emails and phone numbers.
 *
 * Phone matching follows ITU-T **E.164**: an international number is `+`,
 * a country code whose first digit is 1-9, and at most 15 digits in total.
 * A regex alone cannot prove a number is dialable — Google's libphonenumber
 * is the reference for that — so the pattern only proposes candidates and
 * {@link isPhoneCandidate} applies the E.164 rules afterwards.
 *
 * The governing rule, and the one that matters in this inbox: **a bare run of
 * digits is never a phone number.** It must carry a `+`, or be visibly
 * grouped. Decoder ids, order references and FCFA amounts are long digit runs
 * and must stay plain text.
 */

/** Digits only — separators are cosmetic in every notation below. */
function digitsOf(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** `12-05-2024` and friends are dates, not numbers to dial. */
const DATE_LIKE = /^\d{1,2}[ -]\d{1,2}[ -]\d{2,4}$|^\d{4}[ -]\d{1,2}[ -]\d{1,2}$/;

type PhoneKind = 'intl' | 'intl00' | 'local';

/**
 * Applies the E.164 constraints a regex cannot express on its own.
 *
 * `00` is the national prefix for international dialling (E.123), not part of
 * E.164, and `00` followed by a bare digit run is indistinguishable from a
 * reference number — so that form is only accepted when visibly grouped.
 */
function isPhoneCandidate(raw: string, kind: PhoneKind): boolean {
  const digits = digitsOf(raw);
  const grouped = /[\s().-]/.test(raw);

  if (kind === 'intl') {
    // E.164: 15 digits max, country code never starts with 0.
    return digits.length >= 8 && digits.length <= 15 && digits[0] !== '0';
  }
  if (kind === 'intl00') {
    // `00` + country code, e.g. `00237657209853`. Grouping is not required
    // here: the `00` prefix already says "number to dial", and this is the
    // form the platform itself writes subscriber numbers in.
    const body = digits.slice(2);
    return body.length >= 8 && body.length <= 15 && body[0] !== '0';
  }
  // National notation, grouped: `6 52 56 56 06`, `695-457-335`. The length is
  // pinned rather than left as a range — a local number is 9 digits, or 12
  // with the country code written without a prefix. Anything else in this
  // inbox is a decoder number, an order reference or an amount, and treating
  // those as dialable is exactly the mistake this whole module exists to avoid.
  if (!grouped || DATE_LIKE.test(raw)) return false;
  if (digits.length === 9) return true;
  return digits.length === 12 && digits.startsWith('237');
}

const PHONE_ALTERNATIVES = [
  // E.164 with optional cosmetic separators.
  //
  // The country code must start **right after** the prefix — one tolerated
  // space, then a digit. Letting the separator class follow the `+` directly
  // made `+ (24300002183847)` a phone number: the `+` swallowed the space and
  // the parenthesis, and what was left was a réabonnement number read as a
  // country code. No notation in the world puts a bracket between `+` and the
  // country code, while `+1 (555) 123-4567` still matches on its `+1`.
  String.raw`\+ ?\d[\d\s().-]{6,21}\d`,
  // International written with the 00 prefix — same rule, same reason.
  String.raw`00 ?\d[\d\s().-]{6,21}\d`,
  // National, grouped: three or more groups, the first of which may be a lone
  // digit — `6 95 45 73 35` is how a Cameroonian number is usually written out.
  // Dots are excluded on purpose: `10.500.000` is money. Length is checked
  // afterwards, which is what keeps this loose shape from matching references.
  String.raw`\d{1,4}(?:[ -]\d{2,4}){2,5}`,
].join('|');

const ENTITY_RE = new RegExp(
  [
    '(?<url>\\b(?:https?|ftp):\\/\\/[^\\s<>"\']+)',
    '(?<www>\\bwww\\.[^\\s<>"\']+)',
    '(?<email>\\b[\\w.!#$%&*+/=?^`{|}~-]+@[\\w-]+(?:\\.[\\w-]+)+\\b)',
    // The leading char keeps the candidate from starting mid-run without
    // needing a lookbehind (unsupported on older Safari); it is trimmed off
    // the match below. Decoder first: it is the stricter pattern, and the
    // phone alternatives all require visible grouping, so the two never
    // compete for the same run of digits.
    `(?<lead>^|[^\\d+])(?:(?<decoder>\\d{13,15})(?!\\d)|(?<phone>${PHONE_ALTERNATIVES}))`,
  ].join('|'),
  'gi',
);

/**
 * Punctuation that ends a sentence rather than belonging to the URL.
 * `)` is handled separately: it is legitimate inside a URL
 * (`…/Test_(page)`), so only an unbalanced one gets stripped.
 */
const TRAILING = /[.,;:!?»"'\]]+$/;

interface Token {
  kind: 'text' | 'url' | 'email' | 'phone' | 'decoder';
  text: string;
  href?: string;
}

/** Drops sentence punctuation and unbalanced closing brackets from a URL. */
function trimUrl(raw: string): string {
  let url = raw.replace(TRAILING, '');
  // A closing paren is part of the URL only if an opening one precedes it.
  while (
    url.endsWith(')') &&
    (url.match(/\(/g)?.length ?? 0) < (url.match(/\)/g)?.length ?? 0)
  ) {
    url = url.slice(0, -1);
  }
  return url;
}

export function tokenizeRichText(text: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of text.matchAll(ENTITY_RE)) {
    const groups = match.groups ?? {};
    // The phone and decoder alternatives consume one leading character for
    // anchoring.
    let start = (match.index ?? 0) + (groups.lead?.length ?? 0);
    let raw = groups.decoder ?? groups.phone ?? match[0];

    let token: Token;
    if (groups.decoder) {
      // `00` + country code makes 14 digits for a Cameroonian number written
      // internationally, and the platform itself writes subscriber numbers
      // that way. A decoder never starts with `00`, so the run is handed back
      // to the phone rules rather than dropped — otherwise the one number the
      // agent actually wants to dial would be the only plain text on the line.
      if (raw.startsWith('00')) {
        if (!isPhoneCandidate(raw, 'intl00')) continue;
        token = { kind: 'phone', text: raw, href: `tel:${raw}` };
      } else {
        token = { kind: 'decoder', text: raw };
      }
    } else if (groups.url || groups.www) {
      raw = trimUrl(raw);
      if (!raw) continue;
      token = {
        kind: 'url',
        text: raw,
        href: groups.www ? `https://${raw}` : raw,
      };
    } else if (groups.email) {
      token = { kind: 'email', text: raw, href: `mailto:${raw}` };
    } else {
      const kind: PhoneKind = raw.startsWith('+')
        ? 'intl'
        : raw.startsWith('00')
          ? 'intl00'
          : 'local';
      if (!isPhoneCandidate(raw, kind)) continue;
      token = { kind: 'phone', text: raw, href: `tel:${raw.replace(/[^\d+]/g, '')}` };
    }

    if (start > cursor) {
      tokens.push({ kind: 'text', text: text.slice(cursor, start) });
    }
    tokens.push(token);
    cursor = start + raw.length;
  }

  if (cursor < text.length) {
    tokens.push({ kind: 'text', text: text.slice(cursor) });
  }
  return tokens;
}

/** First http(s) URL in `text`, normalised — used by the composer preview. */
export function extractFirstUrl(text: string): string | null {
  for (const token of tokenizeRichText(text)) {
    if (token.kind === 'url' && token.href) return token.href;
  }
  return null;
}

// ─── Rendering ───────────────────────────────────────────────────────────────

/** Wraps every occurrence of `term` in a <mark>, case-insensitively. */
const Highlighted: React.FC<{ text: string; term?: string }> = ({ text, term }) => {
  const needle = term?.trim() ?? '';
  if (!needle) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  const haystack = text.toLowerCase();
  const lower = needle.toLowerCase();
  let cursor = 0;
  let key = 0;

  for (;;) {
    const at = haystack.indexOf(lower, cursor);
    if (at === -1) {
      parts.push(text.slice(cursor));
      break;
    }
    if (at > cursor) parts.push(text.slice(cursor, at));
    parts.push(
      <mark key={key++} className="bg-[#fbe9a1] text-inherit rounded-[2px]">
        {text.slice(at, at + needle.length)}
      </mark>,
    );
    cursor = at + needle.length;
  }
  return <>{parts}</>;
};

interface RichTextProps {
  text: string;
  /** In-chat search term, highlighted inside plain text *and* link labels. */
  highlight?: string;
  className?: string;
}

/**
 * Message body with links, emails and phone numbers turned into anchors, and
 * the search term highlighted inside all of them.
 */
export const RichText: React.FC<RichTextProps> = ({ text, highlight, className }) => {
  const tokens = useMemo(() => tokenizeRichText(text), [text]);
  // Null outside the inbox (and wherever the provider is not mounted): decoder
  // numbers then render as the plain text they have always been.
  const reabo = useReaboEntity();

  return (
    <>
      {tokens.map((token, i) => {
        if (token.kind === 'text') {
          return <Highlighted key={i} text={token.text} term={highlight} />;
        }
        if (token.kind === 'decoder') {
          if (!reabo) {
            return <Highlighted key={i} text={token.text} term={highlight} />;
          }
          return (
            <button
              key={i}
              type="button"
              // The bubble has its own click handlers (lightbox, menus); the
              // lookup must not reach them.
              onClick={(e) => {
                e.stopPropagation();
                reabo.openDecoder(token.text, e.currentTarget.getBoundingClientRect());
              }}
              title="Rechercher cet abonné"
              // Green rather than the link blue: a decoder number opens a
              // lookup inside the app, it does not leave for the web.
              className={cn(
                'text-wa-teal underline decoration-dotted underline-offset-2 hover:brightness-110',
                className,
              )}
            >
              <Highlighted text={token.text} term={highlight} />
            </button>
          );
        }
        return (
          <a
            key={i}
            href={token.href}
            target={token.kind === 'url' ? '_blank' : undefined}
            rel={token.kind === 'url' ? 'noopener noreferrer' : undefined}
            // The bubble has its own click handlers (lightbox, menus); a link
            // press must not reach them.
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'text-[#027eb5] underline underline-offset-2 hover:brightness-110',
              // Long URLs must break rather than widen the bubble.
              token.kind === 'url' && 'break-all',
              className,
            )}
          >
            <Highlighted text={token.text} term={highlight} />
          </a>
        );
      })}
    </>
  );
};
