import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MonthCalendar } from '@/components/ui/DateRangePicker';

interface DatePickerProps {
  /** Selected day as `yyyy-mm-dd`, or '' for none. */
  value: string;
  onChange: (day: string) => void;
  /** Text shown on the trigger when nothing is selected. */
  placeholder?: string;
  align?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  /** Swaps the calendar icon for a spinner while the caller is working. */
  busy?: boolean;
  /** Show the clear (×) affordance once a day is picked. */
  clearable?: boolean;
}

/**
 * Single-day picker built on the project's own {@link MonthCalendar}, so the
 * grid, the French labels and the today/selection styling match the range
 * picker used elsewhere. Nothing native: `<input type="date">` renders a
 * different widget in every browser.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Choisir une date',
  align = 'left',
  className,
  disabled,
  busy,
  clearable = true,
}) => {
  const [open, setOpen] = useState(false);
  const selected = value ? dayjs(value) : null;
  const [month, setMonth] = useState(() => (selected ?? dayjs()).startOf('month'));
  const rootRef = useRef<HTMLDivElement>(null);

  // Re-centre on the selected day whenever the panel is reopened.
  useEffect(() => {
    if (open) setMonth((selected ?? dayjs()).startOf('month'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // don't also close the surface behind us
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const label = selected ? selected.format('DD/MM/YYYY') : placeholder;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1',
          disabled && 'opacity-60',
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex min-w-0 cursor-pointer items-center gap-1.5 disabled:cursor-not-allowed"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin text-wa-icon" />
          ) : (
            <CalendarDays size={14} className="text-wa-icon" />
          )}
          <span
            className={cn(
              'truncate text-xs',
              selected ? 'text-wa-text' : 'text-wa-muted',
            )}
          >
            {label}
          </span>
        </button>
        {clearable && selected && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Effacer la date"
            className="shrink-0 rounded-full p-0.5 text-wa-icon transition-colors hover:bg-wa-hover"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Choisir une date"
          className={cn(
            'absolute top-[calc(100%+8px)] z-50 rounded-xl border border-wa-border bg-white p-3 shadow-xl',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <MonthCalendar
            month={month}
            selectStart={selected}
            selectEnd={selected}
            hoverDate={null}
            onDayClick={(day) => {
              onChange(day.format('YYYY-MM-DD'));
              setOpen(false);
            }}
            onDayHover={() => undefined}
            allowPrev
            allowNext
            onPrev={() => setMonth((m) => m.subtract(1, 'month'))}
            onNext={() => setMonth((m) => m.add(1, 'month'))}
          />
          <div className="mt-1 flex justify-between border-t border-wa-border pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(dayjs().format('YYYY-MM-DD'));
                setOpen(false);
              }}
              className="rounded-md px-2 py-1 text-xs text-wa-teal transition-colors hover:bg-wa-hover"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-xs text-wa-muted transition-colors hover:bg-wa-hover"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
