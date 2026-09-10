import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dropdown } from './Dropdown';

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

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Ouverte' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'RESOLVED', label: 'Résolue' },
  { value: 'CLOSED', label: 'Fermée' },
];

export const StatusPill: React.FC<StatusPillProps> = ({ status, onChange }) => (
  <Dropdown
    label="Statut de la conversation"
    value={status}
    options={STATUS_OPTIONS}
    onChange={onChange}
    trigger={
      <span
        className={cn(
          'flex items-center gap-1 rounded-2xl px-3 py-1 text-xs font-semibold transition-all',
          pillClasses[status] ?? 'bg-wa-status-closed-bg text-wa-status-closed',
        )}
      >
        {STATUS_OPTIONS.find((o) => o.value === status)?.label ?? 'Fermée'}
        <ChevronDown size={12} />
      </span>
    }
  />
);
