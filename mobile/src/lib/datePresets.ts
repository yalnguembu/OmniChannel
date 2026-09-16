/**
 * Préréglages de plage de dates — portage de `DATE_PRESETS` de
 * `src/components/ui/DateRangePicker.tsx` du web : mêmes clés, mêmes libellés,
 * mêmes groupes et mêmes bornes, pour que les deux clients proposent exactement
 * la même liste.
 *
 * Le web s'appuie sur dayjs ; ici tout est en `Date` natif, l'app mobile n'a pas
 * cette dépendance pour ces quelques calculs.
 */

export interface DatePreset {
  key: string;
  label: string;
  group: string;
  /** Bornes au format `yyyy-mm-dd`, celui que portent les filtres. */
  getRange: () => { dateFrom: string; dateTo: string };
}

/** `yyyy-mm-dd` en heure locale — `toISOString()` basculerait en UTC. */
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const day = (d: Date, delta: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + delta);
  return next;
};

const month = (d: Date, delta: number) => {
  const next = new Date(d);
  next.setMonth(next.getMonth() + delta);
  return next;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** Le lundi de la semaine de `d` — le web fait démarrer la semaine lundi. */
const weekStart = (d: Date) => day(d, -(((d.getDay() + 6) % 7)));

const range = (start: Date, end: Date) => ({ dateFrom: isoDay(start), dateTo: isoDay(end) });

const mk = (
  key: string,
  label: string,
  group: string,
  getRange: () => { dateFrom: string; dateTo: string },
): DatePreset => ({ key, label, group, getRange });

export const DATE_PRESETS: DatePreset[] = [
  // ── Jours ──────────────────────────────────
  mk("today", "Aujourd'hui", "Jours", () => {
    const t = new Date();
    return range(t, t);
  }),
  mk("yesterday", "Hier", "Jours", () => {
    const y = day(new Date(), -1);
    return range(y, y);
  }),
  mk("last3days", "3 derniers jours", "Jours", () => {
    const t = new Date();
    return range(day(t, -2), t);
  }),

  // ── Semaines ───────────────────────────────
  mk("thisweek", "Cette semaine", "Semaines", () => {
    const s = weekStart(new Date());
    return range(s, day(s, 6));
  }),
  mk("lastweek", "Semaine passée", "Semaines", () => {
    const s = day(weekStart(new Date()), -7);
    return range(s, day(s, 6));
  }),

  // ── Mois ───────────────────────────────────
  mk("thismonth", "Ce mois", "Mois", () => {
    const t = new Date();
    return range(startOfMonth(t), endOfMonth(t));
  }),
  mk("lastmonth", "Mois passé", "Mois", () => {
    const lm = month(new Date(), -1);
    return range(startOfMonth(lm), endOfMonth(lm));
  }),
  mk("last3m", "3 derniers mois", "Mois", () => {
    const t = new Date();
    return range(month(t, -3), t);
  }),
  mk("last6m", "6 derniers mois", "Mois", () => {
    const t = new Date();
    return range(month(t, -6), t);
  }),

  // ── Trimestres ─────────────────────────────
  mk("thisq", "Ce trimestre", "Trimestres", () => {
    const t = new Date();
    const q = Math.floor(t.getMonth() / 3);
    return range(
      new Date(t.getFullYear(), q * 3, 1),
      endOfMonth(new Date(t.getFullYear(), q * 3 + 2, 1)),
    );
  }),
  mk("lastq", "Trimestre passé", "Trimestres", () => {
    const t = new Date();
    const q = Math.floor(t.getMonth() / 3);
    const pq = q === 0 ? 3 : q - 1;
    const yr = q === 0 ? t.getFullYear() - 1 : t.getFullYear();
    return range(new Date(yr, pq * 3, 1), endOfMonth(new Date(yr, pq * 3 + 2, 1)));
  }),

  // ── Semestres ──────────────────────────────
  mk("thissem", "Ce semestre", "Semestres", () => {
    const t = new Date();
    const y = t.getFullYear();
    return t.getMonth() < 6
      ? range(new Date(y, 0, 1), endOfMonth(new Date(y, 5, 1)))
      : range(new Date(y, 6, 1), endOfMonth(new Date(y, 11, 1)));
  }),
  mk("lastsem", "Semestre passé", "Semestres", () => {
    const t = new Date();
    const y = t.getFullYear();
    return t.getMonth() < 6
      ? range(new Date(y - 1, 6, 1), endOfMonth(new Date(y - 1, 11, 1)))
      : range(new Date(y, 0, 1), endOfMonth(new Date(y, 5, 1)));
  }),

  // ── Années ─────────────────────────────────
  mk("thisyear", "Cette année", "Années", () => {
    const y = new Date().getFullYear();
    return range(new Date(y, 0, 1), new Date(y, 11, 31));
  }),
  mk("lastyear", "Année passée", "Années", () => {
    const y = new Date().getFullYear() - 1;
    return range(new Date(y, 0, 1), new Date(y, 11, 31));
  }),
  mk("last3y", "3 dernières années", "Années", () => {
    const y = new Date().getFullYear();
    return range(new Date(y - 3, 0, 1), new Date(y, 11, 31));
  }),
];

/** Groupes dans l'ordre de la liste, comme la colonne du sélecteur web. */
export const DATE_PRESET_GROUPS: [string, DatePreset[]][] = DATE_PRESETS.reduce(
  (groups, preset) => {
    const existing = groups.find(([name]) => name === preset.group);
    if (existing) existing[1].push(preset);
    else groups.push([preset.group, [preset]]);
    return groups;
  },
  [] as [string, DatePreset[]][],
);

/** Clé du préréglage dont les bornes correspondent exactement, s'il y en a une. */
export function matchPreset(dateFrom: string, dateTo: string): string | undefined {
  if (!dateFrom && !dateTo) return undefined;
  return DATE_PRESETS.find((p) => {
    const r = p.getRange();
    return r.dateFrom === dateFrom && r.dateTo === dateTo;
  })?.key;
}
