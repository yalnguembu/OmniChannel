import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

/**
 * Visual cron builder (minute hour day-of-month month day-of-week, 0=dimanche).
 * Emits the raw cron string; advanced users can edit it directly.
 */

const DOW = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const pad = (n: string | number) => String(n).padStart(2, "0");

type Freq = "daily" | "weekly" | "monthly" | "custom";

interface CronEditorProps {
  value: string;
  onChange: (cron: string) => void;
}

export function CronEditor({ value, onChange }: CronEditorProps) {
  const parts = (value || "0 7 * * *").split(/\s+/);
  while (parts.length < 5) parts.push("*");
  const [mi, ho, dom, , dow] = parts;

  const freq: Freq = useMemo(() => {
    if (dow !== "*") return "weekly";
    if (dom !== "*") return "monthly";
    if (mi !== "*" && ho !== "*") return "daily";
    return "custom";
  }, [mi, ho, dom, dow]);

  const time = `${pad(ho === "*" ? "0" : ho)}:${pad(mi === "*" ? "0" : mi)}`;

  const build = (next: {
    freq?: Freq;
    time?: string;
    dow?: string;
    dom?: string;
    raw?: string;
  }) => {
    const f = next.freq ?? freq;
    const [h, m] = (next.time ?? time).split(":");
    if (f === "custom") return onChange(next.raw ?? value);
    if (f === "daily") return onChange(`${+m} ${+h} * * *`);
    if (f === "weekly") return onChange(`${+m} ${+h} * * ${next.dow ?? (dow === "*" ? "1" : dow)}`);
    if (f === "monthly") return onChange(`${+m} ${+h} ${next.dom ?? (dom === "*" ? "1" : dom)} * *`);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          label="Fréquence"
          value={freq}
          onChange={(e) => build({ freq: e.target.value as Freq })}
          options={[
            { value: "daily", label: "Chaque jour" },
            { value: "weekly", label: "Chaque semaine" },
            { value: "monthly", label: "Chaque mois" },
            { value: "custom", label: "Personnalisé" },
          ]}
        />
        {freq !== "custom" && (
          <Input
            label="Heure"
            type="time"
            value={time}
            onChange={(e) => build({ time: e.target.value })}
          />
        )}
        {freq === "weekly" && (
          <Select
            label="Jour de la semaine"
            value={dow === "*" ? "1" : dow}
            onChange={(e) => build({ dow: e.target.value })}
            options={DOW.map((d, i) => ({ value: String(i), label: d }))}
          />
        )}
        {freq === "monthly" && (
          <Input
            label="Jour du mois"
            type="number"
            value={dom === "*" ? "1" : dom}
            onChange={(e) => build({ dom: e.target.value })}
          />
        )}
      </div>

      <Input
        label="Expression cron"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
      />
      <p className="text-[11px] text-[#8BAFC0]">
        Format : minute heure jour-du-mois mois jour-de-semaine (0 = dimanche).
      </p>
    </div>
  );
}
