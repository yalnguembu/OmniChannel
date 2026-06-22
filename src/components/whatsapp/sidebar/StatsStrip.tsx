import React from 'react';
import { cn } from '@/lib/utils';
import type { Filter } from '@/models/whatsapp.models';

interface StatsVM {
  all: number;
  open: number;
  pending: number;
  resolved: number;
  unread: number;
  closed: number;
}

interface StatsStripProps {
  stats: StatsVM;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
}

interface ChipConfig {
  key: Filter;
  label: string;
  count: number;
}

export const StatsStrip: React.FC<StatsStripProps> = ({ stats, filter, onFilterChange }) => {
  const chips: ChipConfig[] = [
    {
      key: 'ALL',
      label: 'Toutes',
      count: 0,
    },
    {
      key: 'UNREAD',
      label: 'Non lues',
      count: stats.unread,
    },
    {
      key: 'OPEN',
      label: 'Ouvertes',
      count: stats.open,
    },
    {
      key: 'PENDING',
      label: 'En attente',
      count: stats.pending,
    },
    {
      key: 'RESOLVED',
      label: 'Résolues',
      count: stats.resolved,
    },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto bg-wa-sidebar px-3 py-2.5 gap-2 shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => {
        const isActive = filter === chip.key;
        // "Toutes" is the sum of the status buckets only — unread is orthogonal
        // (an unread conversation already counts in its status), so adding it
        // here double-counted.
        const total =
          chip.key === 'ALL'
            ? stats.open + stats.pending + stats.resolved + stats.closed
            : chip.count;

        return (
          <button
            key={chip.key}
            onClick={() => onFilterChange(chip.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap cursor-pointer select-none transition-all duration-150 shrink-0',
              isActive
                ? 'bg-[#d9f8c4] text-wa-text font-semibold border border-[#b7efaa]'
                : 'bg-white text-wa-text border border-wa-border hover:border-wa-icon/40 hover:bg-wa-hover'
            )}
          >
            {chip.label}
            {total > 0 && (
              <span className="tabular-nums">{total}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
