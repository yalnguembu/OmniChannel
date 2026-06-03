import React from 'react';
import { cn } from '@/lib/utils';

// ─── Unread Badge ─────────────────────────────────────────────────────────────

interface UnreadBadgeProps {
  count: number;
  muted?: boolean;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, muted = false }) => {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        'min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums',
        muted ? 'bg-wa-icon/40 text-white' : 'bg-wa-green text-white'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

// ─── Status Dot ───────────────────────────────────────────────────────────────

interface StatusDotProps {
  status: string;
}

const dotClasses: Record<string, string> = {
  OPEN:     'bg-wa-status-open',
  PENDING:  'bg-wa-status-pending',
  RESOLVED: 'bg-wa-status-resolved',
  CLOSED:   'bg-wa-status-closed',
};

export const StatusDot: React.FC<StatusDotProps> = ({ status }) => (
  <span
    className={cn(
      'size-2 rounded-full flex-shrink-0',
      dotClasses[status] ?? 'bg-wa-status-closed'
    )}
  />
);

// ─── Status Pill (select-like) ────────────────────────────────────────────────

interface StatusPillProps {
  status: string;
  onChange: (status: string) => void;
}

const pillClasses: Record<string, string> = {
  OPEN:     'bg-wa-status-open-bg     text-wa-status-open',
  PENDING:  'bg-wa-status-pending-bg  text-wa-status-pending',
  RESOLVED: 'bg-wa-status-resolved-bg text-wa-status-resolved',
  CLOSED:   'bg-wa-status-closed-bg   text-wa-status-closed',
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, onChange }) => (
  <select
    value={status}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      'px-3 py-1 rounded-2xl text-xs font-semibold border-none outline-none cursor-pointer appearance-none pr-5 transition-all',
      pillClasses[status] ?? 'bg-wa-status-closed-bg text-wa-status-closed'
    )}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 4px center',
    }}
  >
    <option value="OPEN">Ouverte</option>
    <option value="PENDING">En attente</option>
    <option value="RESOLVED">Résolue</option>
    <option value="CLOSED">Fermée</option>
  </select>
);
