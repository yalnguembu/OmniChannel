/**
 * One palette for the whole Reabo feature.
 *
 * WhatsApp's brand green (`#25d366`) and its send green (`#00a884`) are made
 * for a small tick and a round button on a photographic background; spread
 * across buttons, pills and selected rows they read as neon. The feature
 * therefore commits to the darker teal of the same family for anything
 * interactive, and to desaturated tints for state — the colour then carries
 * meaning instead of shouting.
 *
 * Kept in one module so a change of mind is one edit, not fifteen.
 */

/** Committing action: filled teal. */
export const TONE_PRIMARY =
  "bg-wa-teal text-white hover:bg-wa-teal-dark disabled:bg-wa-teal/50";

/** Selected row or option: tinted ground, teal edge. */
export const TONE_SELECTED = "border-wa-teal bg-[#f1f8f6]";

/** Form control accent (checkbox, radio). */
export const TONE_ACCENT = "accent-wa-teal";

/** Focused field. */
export const TONE_FIELD_FOCUS = "focus:border-wa-teal focus:outline-none";

/** State tints — flat, low saturation, legible at 11px. */
export const TONE_STATE = {
  success: "bg-[#e8f3ee] text-[#0e6b52]",
  failed: "bg-[#fdeceb] text-[#b23b2c]",
  draft: "bg-[#f1efeb] text-[#6f6e69]",
  warning: "bg-[#fdf2e3] text-[#9a6412]",
} as const;

/** Error text and the band it sits on. */
export const TONE_ERROR_TEXT = "text-[#b23b2c]";
export const TONE_ERROR_BAND = "bg-[#fdeceb] text-[#b23b2c]";

/** Status dot of the connection pill. */
export const TONE_DOT = {
  connected: "bg-wa-teal",
  expired: "bg-[#c8891f]",
  disconnected: "bg-wa-muted",
} as const;
