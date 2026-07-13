/**
 * Human-readable rendering of a cron expression, mirroring the frequency model
 * of the campaign CronEditor (minute hour day-of-month month day-of-week,
 * 0 = dimanche). Used to show the execution frequency instead of the raw cron.
 */

export const CRON_DOW = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const pad = (n: string | number) => String(n).padStart(2, "0");

/** Turn a cron string into a French frequency label (e.g. "Chaque jour à 07:00"). */
export function describeCron(cron?: string | null): string {
  if (!cron || !cron.trim()) return "—";
  const parts = cron.trim().split(/\s+/);
  while (parts.length < 5) parts.push("*");
  const [mi, ho, dom, , dow] = parts;
  const time = `${pad(ho === "*" ? "0" : ho)}:${pad(mi === "*" ? "0" : mi)}`;

  // Same precedence as CronEditor: weekly > monthly > daily > custom.
  if (dow !== "*") {
    const day = CRON_DOW[Number(dow)];
    return day ? `Chaque ${day.toLowerCase()} à ${time}` : "Planification personnalisée";
  }
  if (dom !== "*") {
    return /^\d+$/.test(dom)
      ? `Le ${Number(dom)} de chaque mois à ${time}`
      : "Planification personnalisée";
  }
  if (mi !== "*" && ho !== "*") return `Chaque jour à ${time}`;
  return "Planification personnalisée";
}
