import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  SlidersHorizontal,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dropdown } from '../shared/Dropdown';
import { DateRangePicker, type DateRange } from '@/components/ui/DateRangePicker';
import type { ConversationFilters as Filters } from '@/store/useWhatsappStore';
import type { User } from '@/models/whatsapp.models';

interface ConversationFiltersProps {
  filters: Filters;
  users: User[];
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

const DIRECTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: '', label: 'Toutes', icon: null },
  {
    value: 'INBOUND',
    label: 'Reçu en dernier',
    icon: <ArrowDownLeft size={14} />,
  },
  {
    value: 'OUTBOUND',
    label: 'Envoyé en dernier',
    icon: <ArrowUpRight size={14} />,
  },
];

/**
 * Sidebar filter popover: assigned agent and last-message direction go to the
 * backend (`assignedToUser` / `lastMessageDirection`); the date range is
 * applied client-side on `lastMessageAt`, which the search endpoint doesn't
 * take.
 */
export const ConversationFilters: React.FC<ConversationFiltersProps> = ({
  filters,
  users,
  onChange,
  onReset,
}) => {
  const [open, setOpen] = useState(false);

  const agentOptions = useMemo(
    () => [
      { value: '', label: 'Tous les agents' },
      ...users.map((u) => ({
        value: u.id,
        label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || u.id,
      })),
    ],
    [users],
  );

  const dateRange: DateRange = {
    start: filters.dateFrom ? dayjs(filters.dateFrom).startOf('day').toDate() : null,
    end: filters.dateTo ? dayjs(filters.dateTo).endOf('day').toDate() : null,
  };

  const onRangeChange = (range: DateRange) => {
    onChange({
      dateFrom: range.start ? dayjs(range.start).format('YYYY-MM-DD') : '',
      dateTo: range.end ? dayjs(range.end).format('YYYY-MM-DD') : '',
    });
  };

  const activeCount =
    (filters.assignedToUser ? 1 : 0) +
    (filters.lastMessageDirection ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Filtres"
        title="Filtres"
        className={cn(
          'relative size-10 rounded-full flex items-center justify-center transition-colors',
          activeCount > 0 || open
            ? 'bg-wa-active text-wa-teal'
            : 'text-wa-icon hover:bg-wa-active',
        )}
      >
        <SlidersHorizontal size={18} />
        {activeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-wa-green text-white text-[10px] font-medium flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-wa-border bg-white p-3.5 shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-wa-text">Filtres</p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="rounded-full p-1 text-wa-icon hover:bg-wa-hover transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Assigned agent */}
              <div className="mb-3">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-wa-muted">
                  Agent assigné
                </span>
                <Dropdown
                  label="Agent assigné"
                  value={filters.assignedToUser}
                  options={agentOptions}
                  onChange={(v) => onChange({ assignedToUser: v })}
                  menuClassName="w-full"
                  trigger={
                    <span className="flex w-full items-center gap-2 rounded-lg border border-wa-border bg-wa-input-bg px-2.5 py-2 text-sm text-wa-text">
                      <UserCheck size={15} className="shrink-0 text-wa-icon" />
                      <span className="min-w-0 flex-1 truncate text-left">
                        {agentOptions.find((o) => o.value === filters.assignedToUser)
                          ?.label ?? 'Tous les agents'}
                      </span>
                      <ChevronDown size={15} className="shrink-0 text-wa-icon" />
                    </span>
                  }
                />
              </div>

              {/* Last message direction */}
              <div className="mb-3">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-wa-muted">
                  Dernier message
                </span>
                <div className="flex gap-1">
                  {DIRECTIONS.map((d) => (
                    <button
                      key={d.value || 'all'}
                      type="button"
                      onClick={() => onChange({ lastMessageDirection: d.value })}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors',
                        filters.lastMessageDirection === d.value
                          ? 'bg-wa-teal text-white'
                          : 'bg-wa-input-bg text-wa-text hover:bg-wa-hover',
                      )}
                    >
                      {d.icon}
                      {d.value ? (d.value === 'INBOUND' ? 'Reçu' : 'Envoyé') : 'Tous'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range (client-side on lastMessageAt) */}
              <div className="mb-3">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-wa-muted">
                  Dernière activité
                </span>
                {/* The project's own range picker — presets included. It stores
                    Dates; the filters keep `yyyy-mm-dd` so they survive a URL
                    round-trip unambiguously. */}
                <DateRangePicker value={dateRange} onChange={onRangeChange} />
              </div>

              <button
                type="button"
                onClick={onReset}
                disabled={activeCount === 0}
                className="w-full rounded-lg border border-wa-border py-1.5 text-xs text-wa-text transition-colors hover:bg-wa-hover disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
