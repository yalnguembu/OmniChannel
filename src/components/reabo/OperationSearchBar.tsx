import React from "react";
import { Search } from "lucide-react";
import { TONE_FIELD_FOCUS } from "./tone";

export interface OperationFilters {
  term: string;
  count: number;
  from: string;
  to: string;
}

const fieldClass = `rounded-md border border-wa-border bg-white px-2 py-1.5 text-xs text-wa-text ${TONE_FIELD_FOCUS}`;

/**
 * Filters over a decoder's transactions.
 *
 * The term goes straight to the paged view's `recherche`, which matches every
 * key field — so the same box answers "les opérations de ce décodeur", "celles
 * payées depuis ce numéro" and "celles de cet abonné" without the agent having
 * to say which one they mean. It starts pre-filled with the decoder, because
 * that is the question being asked nine times out of ten.
 */
export const OperationSearchBar: React.FC<{
  value: OperationFilters;
  onChange: (next: OperationFilters) => void;
}> = ({ value, onChange }) => {
  const set = (patch: Partial<OperationFilters>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-2 pb-2">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-wa-icon"
        />
        <input
          id="reabo-ops-term"
          value={value.term}
          onChange={(e) => set({ term: e.target.value })}
          placeholder="N° décodeur, téléphone, n° abonné…"
          className={`w-full pl-8 ${fieldClass}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-wa-muted">
          Du
          <input
            id="reabo-ops-from"
            type="date"
            value={value.from}
            onChange={(e) => set({ from: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-wa-muted">
          au
          <input
            id="reabo-ops-to"
            type="date"
            value={value.to}
            onChange={(e) => set({ to: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-wa-muted">
          Afficher
          <select
            id="reabo-ops-count"
            value={value.count}
            onChange={(e) => set({ count: Number(e.target.value) })}
            className={fieldClass}
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};
