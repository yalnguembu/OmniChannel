/**
 * Colour for an arbitrary backend status string.
 *
 * The client-status vocabulary comes from `GET /api/Client/statuses` and is
 * not a fixed enum, so values are matched by shape rather than listed: a new
 * status added server-side still gets a sensible colour instead of falling
 * through to "unknown".
 */
export interface StatusTone {
  /** Background class for a small indicator dot. */
  dot: string;
  /** Text/icon colour class. */
  text: string;
}

const NEGATIVE = /(opted[_ -]?out|unsubscrib|desinscri|désinscri|block|blacklist|banned|spam|invalid|refus)/;
const POSITIVE = /(^|[_ -])(active|actif|opted[_ -]?in|subscrib|valid|confirmed|ok)/;
const WAITING = /(pending|attente|paused|pause|draft|brouillon|todo)/;
const DORMANT = /(inactive|inactif|archiv|closed|ferm|deleted|supprim)/;

export function statusTone(status?: string | null): StatusTone | null {
  const s = (status ?? '').trim().toLowerCase();
  if (!s) return null;
  if (NEGATIVE.test(s)) return { dot: 'bg-error', text: 'text-error' };
  if (WAITING.test(s))
    return { dot: 'bg-wa-status-pending', text: 'text-wa-status-pending' };
  if (DORMANT.test(s))
    return { dot: 'bg-wa-status-closed', text: 'text-wa-status-closed' };
  if (POSITIVE.test(s))
    return { dot: 'bg-wa-status-open', text: 'text-wa-status-open' };
  // Known but unclassified — still worth showing that a status is set.
  return { dot: 'bg-wa-status-resolved', text: 'text-wa-status-resolved' };
}
